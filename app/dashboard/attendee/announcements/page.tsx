"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";

export default function AttendeeAnnouncements() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
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
        .select("*, events(name)")
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
          ) : announcements.length === 0 ? (
            <div className="text-gray-500">
              No announcements for your events yet.
            </div>
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
                  <div className="text-xs text-gray-500">
                    Event: {a.events?.name || a.event_id}
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
