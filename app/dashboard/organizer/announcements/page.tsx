"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";

type User = {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
};

type Event = {
  id: string;
  name: string;
};

type Announcement = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  event_id: string;
  organizer_id: string;
  events?: {
    name: string;
  };
};

export default function OrganizerAnnouncements() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [form, setForm] = useState({ event_id: "", title: "", message: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const getUserProfileAndEvents = async () => {
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
        // Fetch events for this organizer
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("id, name")
          .eq("organizer_id", userData.user.id)
          .order("created_at", { ascending: false });
        if (eventsError) {
          console.error("Error fetching events:", eventsError);
        } else {
          setEvents(eventsData || []);
          // Set default event for form if available
          if ((eventsData || []).length > 0) {
            setForm((f) => ({ ...f, event_id: eventsData[0].id }));
          }
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserProfileAndEvents();
  }, [supabase]);

  // Fetch announcements for organizer's events
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!user) return;
      setAnnouncementLoading(true);
      try {
        if (events.length === 0) {
          setAnnouncements([]);
          return;
        }
        const eventIds = events.map((e) => e.id);
        const { data, error } = await supabase
          .from("announcements")
          .select("*, events(name)")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false });
        if (error) {
          setError("Failed to fetch announcements");
          setAnnouncements([]);
        } else {
          setAnnouncements(data || []);
        }
      } finally {
        setAnnouncementLoading(false);
      }
    };
    fetchAnnouncements();
  }, [user, events, supabase]);

  if (loading) {
    return (
      <DashboardLayout role="organizer">
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
    <DashboardLayout role="organizer">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Announcements</h3>
          </div>
          {/* Create Announcement Form */}
          <form
            className="mb-8 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setCreating(true);
              setError("");
              try {
                if (!form.event_id || !form.title || !form.message) {
                  setError("All fields are required.");
                  setCreating(false);
                  return;
                }
                const { error } = await supabase.from("announcements").insert({
                  event_id: form.event_id,
                  organizer_id: user?.id,
                  title: form.title,
                  message: form.message,
                });
                if (error) {
                  setError("Failed to create announcement");
                } else {
                  setForm((f) => ({ ...f, title: "", message: "" }));
                  // Refresh announcements
                  const eventIds = events.map((e) => e.id);
                  const { data } = await supabase
                    .from("announcements")
                    .select("*, events(name)")
                    .in("event_id", eventIds)
                    .order("created_at", { ascending: false });
                  setAnnouncements(data || []);
                }
              } finally {
                setCreating(false);
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium mb-1">Event</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.event_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, event_id: e.target.value }))
                }
                required
              >
                {events.length === 0 ? (
                  <option value="">No events found</option>
                ) : (
                  events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              disabled={creating}
            >
              {creating ? "Posting..." : "Post Announcement"}
            </button>
          </form>
          {/* Announcements List */}
          {announcementLoading ? (
            <div>Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-gray-500">No announcements yet.</div>
          ) : (
            <ul className="space-y-4">
              {announcements.map((a) => (
                <li key={a.id} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-lg">{a.title}</span>
                    <span className="text-xs text-gray-400">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">{a.message}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      Event: {a.events?.name || a.event_id}
                    </div>
                    {user && a.organizer_id === user.id && (
                      <button
                        className="text-red-600 text-xs hover:underline ml-4"
                        onClick={async () => {
                          if (
                            !confirm(
                              "Are you sure you want to delete this announcement?"
                            )
                          )
                            return;
                          const { error } = await supabase
                            .from("announcements")
                            .delete()
                            .eq("id", a.id);
                          if (!error) {
                            setAnnouncements((prev) =>
                              prev.filter((ann) => ann.id !== a.id)
                            );
                          } else {
                            alert("Failed to delete announcement");
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
