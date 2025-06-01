"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";
import CreateEventForm from "@/app/components/events/CreateEventForm";

type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  category: string;
  price: number;
  image_url: string | null;
};

export default function OrganizerEvents() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  // Fetch organizer's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData?.user) {
          setError("You must be logged in to view your events");
          setLoading(false);
          return;
        }

        // Get events created by this organizer
        const { data, error: eventsError } = await supabase
          .from("events")
          .select(
            "id, name, date, location, status, category, price, image_url"
          )
          .eq("organizer_id", userData.user.id)
          .order("date", { ascending: false });

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setError("Failed to load events");
          setLoading(false);
          return;
        }

        setEvents(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [supabase]);

  const handleCreateSuccess = (eventId: string) => {
    // Refresh the events list after creating a new event
    supabase
      .from("events")
      .select("id, name, date, location, status, category, price, image_url")
      .eq("id", eventId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setEvents((prevEvents) => [data as Event, ...prevEvents]);
        }
      });
  };

  const handlePublish = async (eventId: string, newStatus: string) => {
    const { error } = await supabase
      .from("events")
      .update({ status: newStatus })
      .eq("id", eventId);
    if (!error) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, status: newStatus } : event
        )
      );
    } else {
      alert("Failed to update event: " + error.message);
    }
  };

  return (
    <DashboardLayout role="organizer">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Events</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Create New Event
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No Events Created Yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first event.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-3 px-4 text-left">Image</th>
                  <th className="py-3 px-4 text-left">Event Name</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-gray-200">
                    <td className="py-3 px-4">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">{event.name}</td>
                    <td className="py-3 px-4">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{event.location}</td>
                    <td className="py-3 px-4">{event.category}</td>
                    <td className="py-3 px-4">${event.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          event.status === "upcoming"
                            ? "bg-green-100 text-green-800"
                            : event.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="px-2 py-1 text-sm bg-blue-600 text-white rounded">
                          Edit
                        </button>
                        <button className="px-2 py-1 text-sm bg-red-600 text-white rounded">
                          Delete
                        </button>
                        {event.status === "published" ? (
                          <button
                            className="px-2 py-1 text-sm bg-yellow-600 text-white rounded"
                            onClick={() => handlePublish(event.id, "draft")}
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            className="px-2 py-1 text-sm bg-green-600 text-white rounded"
                            onClick={() => handlePublish(event.id, "published")}
                          >
                            Publish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Event Modal - Centered in the middle of screen */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl">
            <div className="relative">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md z-10 hover:bg-gray-100"
                aria-label="Close form"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <CreateEventForm
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
