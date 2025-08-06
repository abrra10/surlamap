"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  registration_count?: number;
  attendance_rate?: number;
};

type DashboardStats = {
  totalEvents: number;
  totalRegistrations: number;
  averageAttendanceRate: number;
  activeEvents: number;
};

export default function OrganizerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRegistrations: 0,
    averageAttendanceRate: 0,
    activeEvents: 0,
  });
  const supabase = createClient();
  const router = useRouter();

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

        // Fetch events for this organizer with registration counts
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(
            "id, name, date, location, status, category, price, image_url, seats"
          )
          .eq("organizer_id", userData.user.id)
          .order("date", { ascending: false });

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setEvents([]);
        } else {
          setEvents(eventsData || []);
        }

        // Calculate stats
        await calculateDashboardStats(userData.user.id, eventsData || []);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserProfileAndEvents();
  }, [supabase]);

  const calculateDashboardStats = async (
    organizerId: string,
    events: Event[]
  ) => {
    try {
      let totalRegistrations = 0;
      let totalAttendanceRate = 0;
      let activeEvents = 0;
      let eventsWithRegistrations = 0;

      // Get current date for active events calculation
      const now = new Date();

      for (const event of events) {
        // Check if event is active (published and not past)
        const eventDate = new Date(event.date);
        if (event.status === "published" && eventDate > now) {
          activeEvents++;
        }

        // Get registration count for this event
        const { count: registrationCount } = await supabase
          .from("registrations")
          .select("id", { count: "exact" })
          .eq("event_id", event.id)
          .eq("status", "confirmed");

        const registrations = registrationCount || 0;
        totalRegistrations += registrations;

        // Calculate attendance rate for this event
        if (event.seats && event.seats > 0) {
          const attendanceRate = (registrations / event.seats) * 100;
          totalAttendanceRate += attendanceRate;
          eventsWithRegistrations++;
        }
      }

      const averageAttendanceRate =
        eventsWithRegistrations > 0
          ? Math.round((totalAttendanceRate / eventsWithRegistrations) * 100) /
            100
          : 0;

      setStats({
        totalEvents: events.length,
        totalRegistrations,
        averageAttendanceRate,
        activeEvents,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const getActiveEvents = () => {
    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return event.status === "published" && eventDate > now;
    });
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

  const activeEvents = getActiveEvents();

  return (
    <DashboardLayout role="organizer">
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome, {user?.full_name || "Organizer"}
          </h2>
          <p className="text-gray-600">
            Here's an overview of your events and performance
          </p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 p-6 rounded-lg shadow">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-medium text-purple-800">
                Active Events
              </h3>
              <span className="text-3xl font-bold">{stats.activeEvents}</span>
            </div>
            <p className="text-sm text-purple-600 mt-2">
              {stats.totalEvents} total events
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-medium text-blue-800">
                Total Registrations
              </h3>
              <span className="text-3xl font-bold">
                {stats.totalRegistrations}
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-2">Across all events</p>
          </div>

          <div className="bg-emerald-50 p-6 rounded-lg shadow">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-medium text-emerald-800">
                Avg. Attendance Rate
              </h3>
              <span className="text-3xl font-bold">
                {stats.averageAttendanceRate}%
              </span>
            </div>
            <p className="text-sm text-emerald-600 mt-2">
              Average across events
            </p>
          </div>
        </div>

        {/* Active Events List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Active Events</h3>
            <Button
              onClick={() => router.push("/dashboard/organizer/events")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create New Event
            </Button>
          </div>

          {activeEvents.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-600 mb-4">
                No active events. Create your first event to get started.
              </p>
              <Button
                onClick={() => router.push("/dashboard/organizer/events")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create New Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              No img
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-lg">
                            {event.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(event.date)} • {event.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.category} • ${event.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {event.seats ? `${event.seats} seats` : "Unlimited"}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/dashboard/organizer/events`)
                        }
                        className="mt-2"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
