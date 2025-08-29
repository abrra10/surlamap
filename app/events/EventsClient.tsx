"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import EventFilters from "./EventFilters";
import { useAuth } from "@/app/contexts/AuthContext";
import EventsSlider from "@/app/components/events/EventsSlider";
import CategorySlider from "@/app/components/events/CategorySlider";
import { searchEvents } from "../../lib/optimizedQueries";

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
  const [events] = useState<Event[]>(initialEvents);
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

  const executeSearchMenu = useCallback(async () => {
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
  }, [search, selectedDate]);

  // Debounced search effect
  useEffect(() => {
    if (!search.trim() && !selectedDate) {
      setSearchResults([]);
      setResultsOpen(false);
      return;
    }
    setResultsOpen(true);
    setResultsLoading(true);
    const handle = setTimeout(() => {
      executeSearchMenu();
    }, 300);
    return () => clearTimeout(handle);
  }, [search, selectedDate, executeSearchMenu]);

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
      registration_date: new Date().toISOString(),
    });

    if (error) {
      console.error("Registration error:", error);
      alert("Failed to register for event. Please try again.");
      return;
    }

    console.log("Successfully registered for event");
    setRegistrations((prev) => ({
      ...prev,
      [event.id]: true,
    }));

    // Show success message
    alert("Successfully registered for event!");
  };

  // Filter events based on search and date
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search.trim() ||
      event.name.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase()) ||
      event.category.toLowerCase().includes(search.toLowerCase());

    const matchesDate =
      !selectedDate ||
      new Date(event.date).toDateString() === selectedDate.toDateString();

    return matchesSearch && matchesDate;
  });

  // Group events by category
  const eventsByCategory = filteredEvents.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = [];
    }
    acc[event.category].push(event);
    return acc;
  }, {} as { [key: string]: Event[] });

  // Get upcoming events (not archived)
  const upcomingEvents = filteredEvents.filter(
    (event) => !isArchived(event.date)
  );

  // Get this month's events
  const thisMonthEvents = filteredEvents.filter((event) =>
    isThisMonth(event.date)
  );

  // Get featured events (you can customize this logic)
  const featuredEvents = upcomingEvents.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <EventFilters
            search={search}
            setSearch={setSearch}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            searchResults={searchResults}
            resultsOpen={resultsOpen}
            resultsLoading={resultsLoading}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Events */}
        <EventsSlider
          title="Featured Events"
          events={featuredEvents}
          emptyMessage="No featured events available at the moment."
          userRole={profile?.role || null}
          user={user || { id: "", full_name: "", email: "", role: "" }}
          registrations={registrations}
          handleAttend={handleAttend}
        />

        {/* This Month's Events */}
        <EventsSlider
          title="This Month"
          events={thisMonthEvents}
          emptyMessage="No events scheduled for this month."
          userRole={profile?.role || null}
          user={user || { id: "", full_name: "", email: "", role: "" }}
          registrations={registrations}
          handleAttend={handleAttend}
        />

        {/* Events by Category */}
        {Object.entries(eventsByCategory).map(([category, categoryEvents]) => (
          <CategorySlider
            key={category}
            category={category}
            events={categoryEvents}
            userRole={profile?.role || null}
            user={user || { id: "", full_name: "", email: "", role: "" }}
            registrations={registrations}
            handleAttend={handleAttend}
          />
        ))}
      </div>
    </div>
  );
}
