"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import EventFilters from "./EventFilters";
import { useAuth } from "@/app/contexts/AuthContext";
import EventsSlider from "../components/events/EventsSlider";
import CategorySlider from "../components/events/CategorySlider";
import {
  getUserProfileWithRole,
  searchEvents,
  clearCache,
} from "../../lib/optimizedQueries";

type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  category: string;
  price: number;
  image_url: string | null;
  seats: number | null;
  registration_count?: number | { count: number };
};

type EventsClientProps = {
  initialEvents: Event[];
};

// Helper function to format category names for display
const formatCategoryName = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    music_entertainment: "Music & Entertainment",
    conferences_professional: "Conferences & Professional",
    food_lifestyle: "Food & Lifestyle",
    sports_fitness: "Sports & Fitness",
    arts_culture: "Arts & Culture",
    tech_innovation: "Tech & Innovation",
    other: "Other Events",
  };

  return (
    categoryMap[category] ||
    category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

// Helper functions for date filtering
const isThisMonth = (dateString: string) => {
  const eventDate = new Date(dateString);
  const now = new Date();
  return (
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getFullYear() === now.getFullYear()
  );
};

const isArchived = (dateString: string) => {
  const event = new Date(dateString);
  const now = new Date();
  return event < now;
};

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [registrations, setRegistrations] = useState<{
    [eventId: string]: boolean;
  }>({});
  const router = useRouter();
  const { user, profile } = useAuth();

  // Search results dropdown state
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);

  const executeSearchMenu = async () => {
    const q = search.trim();
    if (!q && !selectedDate) return;
    setResultsLoading(true);

    try {
      // Use optimized search query
      const data = await searchEvents(q, selectedDate);
      setSearchResults(data as Event[]);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  // As-you-type search with debounce
  useEffect(() => {
    const q = search.trim();
    if (!q && !selectedDate) {
      setResultsOpen(false);
      setResultsLoading(false);
      setSearchResults([]);
      return;
    }
    setResultsOpen(true);
    setResultsLoading(true);
    const handle = setTimeout(() => {
      executeSearchMenu();
    }, 300);
    return () => clearTimeout(handle);
  }, [search, selectedDate]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user || profile?.role !== "attendee") {
        console.log(
          "Not fetching registrations - user:",
          !!user,
          "role:",
          profile?.role
        );
        return;
      }

      console.log("Fetching registrations for user:", user.id);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("registrations")
        .select("event_id")
        .eq("attendee_id", user.id)
        .eq("status", "confirmed");

      if (!error && data) {
        const regMap: { [eventId: string]: boolean } = {};
        data.forEach((reg: { event_id: string }) => {
          regMap[reg.event_id] = true;
        });
        console.log("User registrations:", regMap);
        setRegistrations(regMap);
      } else if (error) {
        console.error("Error fetching registrations:", error);
      }
    };
    fetchRegistrations();
  }, [user, profile?.role]);

  const getConfirmedCount = async (eventId: string) => {
    // Use the registration count from the optimized query if available
    const event = events.find((e) => e.id === eventId);
    if (event?.registration_count !== undefined) {
      if (typeof event.registration_count === "number") {
        return event.registration_count;
      }
      return event.registration_count.count || 0;
    }

    // Fallback to direct query if not available
    const supabase = createClient();
    const { count } = await supabase
      .from("registrations")
      .select("id", { count: "exact" })
      .eq("event_id", eventId)
      .eq("status", "confirmed");
    return count || 0;
  };

  const handleAttend = async (event: Event) => {
    console.log("Registration attempt:", {
      user: user?.id,
      userRole: profile?.role,
      eventId: event.id,
      eventName: event.name,
      alreadyRegistered: registrations[event.id],
    });

    if (!user || profile?.role !== "attendee") {
      console.log("User not logged in or not attendee, redirecting to login");
      router.push("/login");
      return;
    }

    if (registrations[event.id]) {
      console.log("User already registered for this event");
      return;
    }

    const confirmedCount = await getConfirmedCount(event.id);
    console.log(
      "Current registration count:",
      confirmedCount,
      "Available seats:",
      event.seats
    );

    if (event.seats !== null && confirmedCount >= event.seats) {
      alert("No seats available for this event.");
      return;
    }

    console.log("Attempting to register user for event...");
    const supabase = createClient();
    const { error } = await supabase.from("registrations").insert({
      event_id: event.id,
      attendee_id: user.id,
      status: "confirmed",
      number_of_seats: 1,
    });

    if (!error) {
      console.log("Registration successful!");
      setRegistrations((prev) => ({ ...prev, [event.id]: true }));
      // Clear cache to refresh data
      clearCache(user.id);
      alert("You are now registered for this event!");
    } else {
      console.error("Registration failed:", error);
      alert("Failed to register: " + error.message);
    }
  };

  // Filter events into sections
  const thisMonthEvents = events.filter(
    (event) => isThisMonth(event.date) && !isArchived(event.date)
  );
  const musicEvents = events.filter(
    (event) =>
      event.category === "music_entertainment" && !isArchived(event.date)
  );
  const conferencesEvents = events.filter(
    (event) =>
      event.category === "conferences_professional" && !isArchived(event.date)
  );
  const foodEvents = events.filter(
    (event) => event.category === "food_lifestyle" && !isArchived(event.date)
  );
  const sportsEvents = events.filter(
    (event) => event.category === "sports_fitness" && !isArchived(event.date)
  );
  const artsEvents = events.filter(
    (event) => event.category === "arts_culture" && !isArchived(event.date)
  );
  const techEvents = events.filter(
    (event) => event.category === "tech_innovation" && !isArchived(event.date)
  );
  const otherEvents = events.filter(
    (event) => event.category === "other" && !isArchived(event.date)
  );

  return (
    <>
      <EventFilters
        search={search}
        setSearch={setSearch}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        searchResults={searchResults}
        resultsOpen={resultsOpen}
        resultsLoading={resultsLoading}
      />

      {/* This Month's Events */}
      {thisMonthEvents.length > 0 && (
        <div className="mb-12">
          <EventsSlider
            title="Happening this Month"
            events={thisMonthEvents}
            emptyMessage="No upcoming events this month..."
            userRole={profile?.role || null}
            user={user}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        </div>
      )}

      {/* Category-based sections */}
      {musicEvents.length > 0 && (
        <div className="mb-12">
          <CategorySlider
            category="music_entertainment"
            events={musicEvents}
            userRole={profile?.role || null}
            user={user}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        </div>
      )}

      {conferencesEvents.length > 0 && (
        <div className="mb-12">
          <CategorySlider
            category="conferences_professional"
            events={conferencesEvents}
            userRole={profile?.role || null}
            user={user}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        </div>
      )}

      {foodEvents.length > 0 && (
        <div className="mb-12">
          <CategorySlider
            category="food_lifestyle"
            events={foodEvents}
            userRole={profile?.role || null}
            user={user}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        </div>
      )}

      {sportsEvents.length > 0 && (
        <div className="mb-12">
          <CategorySlider
            category="sports_fitness"
            events={sportsEvents}
            userRole={profile?.role || null}
            user={user}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        </div>
      )}

      {artsEvents.length > 0 && (
        <div className="mb-12">
          <CategorySlider
            category="arts_culture"
            events={artsEvents}
            userRole={profile?.role || null}
            user={user}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        </div>
      )}

      {techEvents.length > 0 && (
        <div className="mb-12">
          <CategorySlider
            category="tech_innovation"
            events={techEvents}
            userRole={profile?.role || null}
            user={user}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        </div>
      )}

      {otherEvents.length > 0 && (
        <div className="mb-12">
          <CategorySlider
            category="other"
            events={otherEvents}
            userRole={profile?.role || null}
            user={user}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        </div>
      )}

      {/* No events message */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <h3 className="font-fugaz text-2xl font-bold text-[#201e36] mb-4">
            No events found
          </h3>
          <p className="font-body text-[#201e36] text-opacity-70 max-w-md mx-auto">
            Check back later for new events or try adjusting your search
            criteria.
          </p>
        </div>
      )}
    </>
  );
}
