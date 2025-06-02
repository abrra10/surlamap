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
            {registeredEvents.map((reg) => (
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
              </div>
            ))}
          </div>
        )}
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            No upcoming events found. Browse available events below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {/* Sample event cards - would be populated from API in real application */}
            <div className="border rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Event Image</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium">Tech Conference 2024</h3>
                <p className="text-sm text-gray-600">
                  October 15, 2024 • Virtual
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-semibold">$99</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Event Image</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium">Music Festival</h3>
                <p className="text-sm text-gray-600">
                  September 20, 2024 • Central Park
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-semibold">$149</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Event Image</span>
              </div>
              <div className="p-4">
                <h3 className="font-medium">Art Exhibition</h3>
                <p className="text-sm text-gray-600">
                  August 5, 2024 • Modern Gallery
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-semibold">$25</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
