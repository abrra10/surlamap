"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import { DatePicker } from "../../components/ui/date-picker";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "../../components/ui/pagination";
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

const categories = [
  "conferences_professional",
  "music_entertainment",
  "food_lifestyle",
  "sports_fitness",
  "arts_culture",
  "tech_innovation",
  "other",
];

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<{
    [eventId: string]: boolean;
  }>({});
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const router = useRouter();
  const pageSize = 6;

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        // Fetch user profile to get role
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

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: true });

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }
      if (selectedDate) {
        const dateStr = selectedDate.toISOString().split("T")[0];
        query = query.gte("date", dateStr).lt("date", dateStr + "T23:59:59");
      }
      // Pagination
      query = query.range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error, count } = await query;
      if (!error && data) {
        setEvents(data);
        // For demo, set pageCount to 5 (replace with real count logic)
        setPageCount(5);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [selectedCategory, search, selectedDate, page]);

  // Fetch registrations for the logged-in attendee
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

  // Helper to count confirmed registrations for an event
  const getConfirmedCount = async (eventId: string) => {
    const supabase = createClient();
    const { count } = await supabase
      .from("registrations")
      .select("id", { count: "exact" })
      .eq("event_id", eventId)
      .eq("status", "confirmed");
    return count || 0;
  };

  // Handle Attend button click
  const handleAttend = async (event: Event) => {
    if (!user || userRole !== "attendee") {
      router.push("/login");
      return;
    }
    // Check if already registered
    if (registrations[event.id]) return;
    // Check seat availability
    const confirmedCount = await getConfirmedCount(event.id);
    if (event.seats !== null && confirmedCount >= event.seats) {
      alert("No seats available for this event.");
      return;
    }
    // Register
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

  return (
    <div className="min-h-screen w-full bg-[#f2fae6] relative">
      {/* Gradient background at the top */}
      <div className="w-full h-48 absolute top-0 left-0 z-0" />
      <div className="relative w-full px-2 md:px-8 py-6 z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-[#201e36] drop-shadow-sm text-center">
          Published Events
        </h1>
        {/* Filters Row */}
        <EventFilters
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          categories={categories}
        />
        {/* Events List */}
        {loading ? (
          <div className="text-[#8ca1a6] text-lg">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-[#8ca1a6] text-lg">No events found.</div>
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
        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page === 1}
                />
              </PaginationItem>
              {[...Array(pageCount)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  aria-disabled={page === pageCount}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
