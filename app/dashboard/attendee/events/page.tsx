"use client";

import DashboardLayout from "@/app/components/dashboard/Layout";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AttendeeEvents() {
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
  }, []);

  return (
    <DashboardLayout role="attendee">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Registered Events</h2>
        {loading ? (
          <div>Loading your events...</div>
        ) : registeredEvents.length === 0 ? (
          <div className="text-gray-600">
            You have not registered for any events yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {registeredEvents.map((reg) => {
              const eventDate = reg.events?.date
                ? new Date(reg.events.date)
                : null;
              const now = new Date();
              let status = "";
              if (eventDate) {
                status = eventDate > now ? "Upcoming" : "Completed";
              }
              return (
                <div
                  key={reg.id}
                  className="border rounded-lg p-4 bg-white shadow"
                >
                  {reg.events?.image_url && (
                    <img
                      src={reg.events.image_url}
                      alt={reg.events.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h4 className="text-lg font-semibold">{reg.events?.name}</h4>
                  <p className="text-gray-600">
                    {reg.events?.date &&
                      new Date(reg.events.date).toLocaleString()}
                  </p>
                  <p className="text-gray-500">{reg.events?.location}</p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Category:</span>{" "}
                    {reg.events?.category}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Price:</span> $
                    {reg.events?.price?.toFixed(2)}
                  </p>
                  {status && (
                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold ${
                        status === "Upcoming"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
