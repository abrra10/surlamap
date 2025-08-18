"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";
import { useRouter } from "next/navigation";

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

export default function OrganizerEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingEvent, setProcessingEvent] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5; // Show 5 events per page
  const supabase = createClient();
  const router = useRouter();

  // Fetch organizer's events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

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
          "id, name, date, location, status, category, price, image_url, seats"
        )
        .eq("organizer_id", userData.user.id)
        .order("created_at", { ascending: false });

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

  useEffect(() => {
    fetchEvents();
  }, [supabase]);

  const handleCreateSuccess = async (eventId: string) => {
    // Refresh the entire events list after creating a new event
    await fetchEvents();
  };

  const handlePublish = async (eventId: string, newStatus: string) => {
    try {
      setProcessingEvent(eventId);
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
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event");
    } finally {
      setProcessingEvent(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setProcessingEvent(eventId);
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (!error) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
      } else {
        alert("Failed to delete event: " + error.message);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    } finally {
      setProcessingEvent(null);
    }
  };

  const handleEdit = (eventId: string) => {
    // For now, we'll navigate to a future edit page
    // You can implement an edit modal or separate page later
    alert(
      "Edit functionality will be implemented soon. For now, you can delete and recreate the event."
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  // Calculate pagination
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout role="organizer">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Events</h2>
          <button
            onClick={() => router.push("/dashboard/organizer/events/create")}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
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
              onClick={() => router.push("/dashboard/organizer/events/create")}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
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
                {currentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
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
                    <td className="py-3 px-4 font-medium">{event.name}</td>
                    <td className="py-3 px-4">{formatDate(event.date)}</td>
                    <td className="py-3 px-4">{event.location}</td>
                    <td className="py-3 px-4 capitalize">
                      {formatCategoryName(event.category)}
                    </td>
                    <td className="py-3 px-4">${event.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                          onClick={() => handleEdit(event.id)}
                          disabled={processingEvent === event.id}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          onClick={() => handleDelete(event.id)}
                          disabled={processingEvent === event.id}
                        >
                          Delete
                        </button>
                        {event.status === "published" ? (
                          <button
                            className="px-2 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors disabled:opacity-50"
                            onClick={() => handlePublish(event.id, "draft")}
                            disabled={processingEvent === event.id}
                          >
                            {processingEvent === event.id
                              ? "Updating..."
                              : "Unpublish"}
                          </button>
                        ) : (
                          <button
                            className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                            onClick={() => handlePublish(event.id, "published")}
                            disabled={processingEvent === event.id}
                          >
                            {processingEvent === event.id
                              ? "Updating..."
                              : "Publish"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages >= 1 && (
              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm rounded-md transition-colors ${
                            currentPage === page
                              ? "bg-purple-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
