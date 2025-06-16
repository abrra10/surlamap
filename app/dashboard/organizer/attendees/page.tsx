"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";

export default function OrganizerAttendeesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [attendeesByEvent, setAttendeesByEvent] = useState<{
    [eventId: string]: any[];
  }>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchEventsAndAttendees = async () => {
      setLoading(true);
      // Get current user (organizer)
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setEvents([]);
        setLoading(false);
        return;
      }
      // Fetch events created by this organizer
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, name, date, location, category, price, image_url")
        .eq("organizer_id", userData.user.id)
        .order("date", { ascending: false });
      if (eventsError || !eventsData) {
        setEvents([]);
        setLoading(false);
        return;
      }
      setEvents(eventsData);
      // For each event, fetch attendees
      const attendeesMap: { [eventId: string]: any[] } = {};
      for (const event of eventsData) {
        const { data: regs, error: regsError } = await supabase
          .from("registrations")
          .select("*, profiles:attendee_id(full_name, email)")
          .eq("event_id", event.id)
          .eq("status", "confirmed");
        attendeesMap[event.id] = regs || [];
      }
      setAttendeesByEvent(attendeesMap);
      setLoading(false);
    };
    fetchEventsAndAttendees();
  }, []);

  return (
    <DashboardLayout role="organizer">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          Attendees for Your Events
        </h2>
        {loading ? (
          <div>Loading attendees...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-600">
            You have not created any events yet.
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event) => (
              <div key={event.id}>
                <h3 className="text-lg font-bold mb-2">{event.name}</h3>
                <p className="text-gray-500 mb-2">
                  {event.date && new Date(event.date).toLocaleString()} |{" "}
                  {event.location}
                </p>
                {attendeesByEvent[event.id] &&
                attendeesByEvent[event.id].length > 0 ? (
                  <ul className="space-y-1">
                    {attendeesByEvent[event.id].map((reg) => (
                      <li key={reg.id} className="flex gap-4 items-center">
                        <span className="font-medium">
                          {reg.full_name || "No Name"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {reg.email}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">
                    No attendees registered yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
