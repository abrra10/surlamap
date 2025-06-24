"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";
import Link from "next/link";

export default function OrganizerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const supabase = createClient();

  // Sample data - in a real app, this would come from database
  const analyticsData = {
    totalEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
  };

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
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserProfileAndEvents();
  }, [supabase]);

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
                Total Events
              </h3>
              <span className="text-3xl font-bold">
                {analyticsData.totalEvents}
              </span>
            </div>
            <Link
              href="/dashboard/organizer/events"
              className="text-purple-600 text-sm hover:underline mt-4 inline-block"
            >
              Manage events →
            </Link>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-medium text-blue-800">
                Total Attendees
              </h3>
              <span className="text-3xl font-bold">
                {analyticsData.totalAttendees}
              </span>
            </div>
            <Link
              href="/dashboard/organizer/attendees"
              className="text-blue-600 text-sm hover:underline mt-4 inline-block"
            >
              View attendees →
            </Link>
          </div>

          <div className="bg-emerald-50 p-6 rounded-lg shadow">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-medium text-emerald-800">
                Total Revenue
              </h3>
              <span className="text-3xl font-bold">
                ${analyticsData.totalRevenue}
              </span>
            </div>
            <Link
              href="/dashboard/organizer/tickets"
              className="text-emerald-600 text-sm hover:underline mt-4 inline-block"
            >
              Ticket sales →
            </Link>
          </div>
        </div>

        {/* Analytics section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Analytics</h3>
            <Link
              href="/dashboard/organizer/analytics"
              className="text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {analyticsData.totalEvents === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-600 mb-4">
                No analytics available yet. Create your first event to see data.
              </p>
              <Link
                href="/dashboard/organizer/events"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 inline-block"
              >
                Create New Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">
                  Attendance Chart (placeholder)
                </span>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">
                  Revenue Chart (placeholder)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
