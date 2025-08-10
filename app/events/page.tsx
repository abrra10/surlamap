"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EventCard from "./EventCard";
import EventFilters from "./EventFilters";

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
};

// Helper function to format category names for display
const formatCategoryName = (category: string) => {
  switch (category) {
    case "conferences_professional":
      return "Conferences & Professional Events";
    case "music_entertainment":
      return "Music & Entertainment";
    case "food_lifestyle":
      return "Food & Lifestyle";
    case "sports_fitness":
      return "Sports & Fitness";
    case "arts_culture":
      return "Arts & Culture";
    case "tech_innovation":
      return "Tech & Innovation";
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
};

// Helper function to check if event is this month
const isThisMonth = (eventDate: string) => {
  const event = new Date(eventDate);
  const now = new Date();
  return (
    event.getMonth() === now.getMonth() &&
    event.getFullYear() === now.getFullYear()
  );
};

// Helper function to check if event is archived (past)
const isArchived = (eventDate: string) => {
  const event = new Date(eventDate);
  const now = new Date();
  return event < now;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<{
    [eventId: string]: boolean;
  }>({});
  const router = useRouter();

  // Search results dropdown state
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    };
    fetchUser();
  }, []);

  const executeSearchMenu = async () => {
    const q = search.trim();
    if (!q && !selectedDate) return;
    setResultsLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("events")
      .select("id, name, location, category, date")
      .eq("status", "published")
      .order("date", { ascending: true })
      .limit(10);

    if (q) {
      const escaped = q.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(
        `name.ilike.%${escaped}%,location.ilike.%${escaped}%,category.ilike.%${escaped}%`
      );
    }

    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      query = query.gte("date", dateStr).lt("date", `${dateStr}T23:59:59`);
    } else {
      // Default to upcoming events if no date specified
      const todayStr = new Date().toISOString().split("T")[0];
      query = query.gte("date", todayStr);
    }

    const { data } = await query;
    setSearchResults((data || []) as Event[]);
    setResultsLoading(false);
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
    const fetchEvents = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: true });

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user || userRole !== "attendee") return;
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
        setRegistrations(regMap);
      }
    };
    fetchRegistrations();
  }, [user, userRole]);

  const getConfirmedCount = async (eventId: string) => {
    const supabase = createClient();
    const { count } = await supabase
      .from("registrations")
      .select("id", { count: "exact" })
      .eq("event_id", eventId)
      .eq("status", "confirmed");
    return count || 0;
  };

  const handleAttend = async (event: Event) => {
    if (!user || userRole !== "attendee") {
      router.push("/login");
      return;
    }
    if (registrations[event.id]) return;
    const confirmedCount = await getConfirmedCount(event.id);
    if (event.seats !== null && confirmedCount >= event.seats) {
      alert("No seats available for this event.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("registrations").insert({
      event_id: event.id,
      attendee_id: user.id,
      status: "confirmed",
      number_of_seats: 1,
    });
    if (!error) {
      setRegistrations((prev) => ({ ...prev, [event.id]: true }));
      alert("You are now registered for this event!");
    } else {
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
  const artsEvents = events.filter(
    (event) => event.category === "arts_culture" && !isArchived(event.date)
  );
  const conferenceEvents = events.filter(
    (event) =>
      event.category === "conferences_professional" && !isArchived(event.date)
  );
  const otherEvents = events.filter(
    (event) =>
      ![
        "music_entertainment",
        "arts_culture",
        "conferences_professional",
      ].includes(event.category) && !isArchived(event.date)
  );
  const archivedEvents = events.filter((event) => isArchived(event.date));

  const renderSection = (
    title: string,
    events: Event[],
    emptyMessage: string
  ) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-[#201e36]">{title}</h2>
      {events.length === 0 ? (
        <p className="text-gray-500 italic">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              userRole={userRole}
              user={user}
              registrations={registrations}
              handleAttend={handleAttend}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f2fae6] relative">
      <div className="w-full h-48 absolute top-0 left-0 z-0" />
      <div className="relative w-full px-2 md:px-8 py-6 z-10">
        <div className="font-montserrat uppercase text-sm font-semibold tracking-widest mb-4 mt-8 text-gray-700 text-center">
          Discover your next adventure
        </div>
        <div className="relative w-full flex justify-center">
          <EventFilters
            search={search}
            setSearch={setSearch}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          {resultsOpen && (
            <div className="absolute left-1/2 top-full -translate-x-1/2 mt-2 w-full max-w-4xl z-50">
              <div className="bg-white rounded-xl shadow-lg border p-2">
                {resultsLoading ? (
                  <div className="p-4 text-sm text-gray-500">Searching…</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No results</div>
                ) : (
                  <ul className="divide-y">
                    {searchResults.map((ev) => (
                      <li key={ev.id} className="hover:bg-gray-50">
                        <Link
                          href={`/events/${ev.id}`}
                          className="block px-4 py-3"
                          onClick={() => setResultsOpen(false)}
                        >
                          <div className="font-medium text-[#201e36]">
                            {ev.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ev.location} • {formatCategoryName(ev.category)}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-[#8ca1a6] text-lg">Loading events...</div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {renderSection(
              "This Month",
              thisMonthEvents,
              "No upcoming events this month..."
            )}
            {renderSection(
              "Music & Entertainment",
              musicEvents,
              "No upcoming music & entertainment events..."
            )}
            {renderSection(
              "Arts & Culture",
              artsEvents,
              "No upcoming arts & culture events..."
            )}
            {renderSection(
              "Conferences & Professional Events",
              conferenceEvents,
              "No upcoming conferences & professional events..."
            )}
            {renderSection(
              "Other Events",
              otherEvents,
              "No other upcoming events..."
            )}
            {renderSection("Archive", archivedEvents, "No past events...")}
          </div>
        )}
      </div>
    </div>
  );
}
