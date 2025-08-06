"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ANNOUNCEMENTS_PER_PAGE = 10;

export default function AttendeeAnnouncements() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<Record<string, string>>({});
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [page, setPage] = useState(1);
  const supabase = createClient();

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        setLoading(true);
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user) {
          return;
        }
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        setUser(profileData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, [supabase]);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setRegisteredEvents([]);
        setLoading(false);
        return;
      }
      // Fetch registrations joined with events
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

  // Fetch announcements for registered events
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!registeredEvents || registeredEvents.length === 0) {
        setAnnouncements([]);
        return;
      }
      setAnnouncementLoading(true);
      const eventIds = registeredEvents
        .map((reg) => reg.event_id || reg.events?.id)
        .filter(Boolean);
      if (eventIds.length === 0) {
        setAnnouncements([]);
        setAnnouncementLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("announcements")
        .select("*, events(name), organizer_id")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setAnnouncements(data);
      } else {
        setAnnouncements([]);
      }
      setAnnouncementLoading(false);
    };
    fetchAnnouncements();
  }, [registeredEvents, supabase]);

  // Fetch organizer names for announcements
  useEffect(() => {
    const fetchOrganizers = async () => {
      const uniqueOrganizerIds = Array.from(
        new Set(announcements.map((a) => a.organizer_id).filter(Boolean))
      );
      if (uniqueOrganizerIds.length === 0) {
        setOrganizers({});
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", uniqueOrganizerIds);
      if (!error && data) {
        const orgMap: Record<string, string> = {};
        data.forEach((profile) => {
          orgMap[profile.id] = profile.full_name;
        });
        setOrganizers(orgMap);
      }
    };
    if (announcements.length > 0) fetchOrganizers();
  }, [announcements, supabase]);

  // Pagination logic
  const totalPages = Math.ceil(announcements.length / ANNOUNCEMENTS_PER_PAGE);
  const paginatedAnnouncements = useMemo(() => {
    const start = (page - 1) * ANNOUNCEMENTS_PER_PAGE;
    return announcements.slice(start, start + ANNOUNCEMENTS_PER_PAGE);
  }, [announcements, page]);

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

  if (loading) {
    return (
      <DashboardLayout role="attendee">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Loading...</h2>
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="attendee">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Announcements</h3>
          {announcementLoading ? (
            <div>Loading announcements...</div>
          ) : paginatedAnnouncements.length === 0 ? (
            <div className="text-gray-500">
              No announcements for your events yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {paginatedAnnouncements.map((a) => (
                <li key={a.id} className="border rounded p-4 bg-gray-50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
                    <span className="font-semibold text-lg">{a.title}</span>
                    <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : ""}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{a.message}</div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center text-xs text-gray-500 gap-1">
                    <span>Event: {a.events?.name || a.event_id}</span>
                    <span>
                      Organizer: {organizers[a.organizer_id] || a.organizer_id}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
      </div>
    </DashboardLayout>
  );
}
