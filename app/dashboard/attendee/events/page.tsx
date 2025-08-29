"use client";

import DashboardLayout from "@/app/components/dashboard/Layout";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type RegisteredEvent = {
  id: string;
  created_at: string;
  events?: {
    id: string;
    name: string;
    date: string;
    location: string;
    category: string;
    price: number;
    meeting_link?: string;
    event_type?: string;
  };
};

const EVENTS_PER_PAGE = 10;

export default function AttendeeEvents() {
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setRegisteredEvents([]);
        setLoading(false);
        return;
      }
      // Fetch registrations joined with events, include registration created_at
      const { data, error } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("attendee_id", userData.user.id)
        .eq("status", "confirmed");
      if (!error && data) {
        setRegisteredEvents(data);
      }
      setLoading(false);
    };
    fetchRegisteredEvents();
  }, [supabase]);

  // Sort by registration date (most recent first)
  const sortedEvents = useMemo(() => {
    return [...registeredEvents].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [registeredEvents]);

  // Pagination logic
  const totalPages = Math.ceil(sortedEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * EVENTS_PER_PAGE;
    return sortedEvents.slice(start, start + EVENTS_PER_PAGE);
  }, [sortedEvents, page]);

  // Helper for pagination links
  function getPageNumbers(current: number, total: number) {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift("...");
    if (current + delta < total - 1) range.push("...");
    range.unshift(1);
    if (total > 1) range.push(total);
    return Array.from(new Set(range));
  }

  return (
    <DashboardLayout role="attendee">
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">My Registered Events</h2>
        {loading ? (
          <div>Loading your events...</div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-gray-600">
            You have not registered for any events yet.
          </div>
        ) : (
          <div className="w-full">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 border-b text-left">Event Name</th>
                  <th className="py-2 px-3 border-b text-left">Date</th>
                  <th className="py-2 px-3 border-b text-left">Location</th>
                  <th className="py-2 px-3 border-b text-left">Category</th>
                  <th className="py-2 px-3 border-b text-left">Price</th>
                  <th className="py-2 px-3 border-b text-left">Status</th>
                  <th className="py-2 px-3 border-b text-left">Meeting Link</th>
                  <th className="py-2 px-3 border-b text-left">
                    Registration Date
                  </th>
                  <th className="py-2 px-3 border-b text-left"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map((reg) => {
                  const event = reg.events;
                  if (!event) return null;
                  const eventDate = event.date ? new Date(event.date) : null;
                  const now = new Date();
                  const status =
                    eventDate && eventDate > now ? "Upcoming" : "Completed";
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 border-b font-medium">
                        {event.name}
                      </td>
                      <td className="py-2 px-3 border-b">
                        {eventDate ? eventDate.toLocaleString() : "-"}
                      </td>
                      <td className="py-2 px-3 border-b">
                        {event.location || "-"}
                      </td>
                      <td className="py-2 px-3 border-b">
                        {event.category || "-"}
                      </td>
                      <td className="py-2 px-3 border-b">
                        {typeof event.price === "number"
                          ? `$${event.price.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="py-2 px-3 border-b">
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                            status === "Upcoming"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-b">
                        {event.event_type === "online" && event.meeting_link ? (
                          <a
                            href={event.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Join Meeting
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-3 border-b">
                        {reg.created_at
                          ? new Date(reg.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-2 px-3 border-b">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/events/${event.id}`)}
                        >
                          View Event
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>
                  {getPageNumbers(page, totalPages).map((p, idx) =>
                    p === "..." ? (
                      <PaginationItem key={"ellipsis-" + idx}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={page === p}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(Number(p));
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                      aria-disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
