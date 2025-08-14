"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/app/components/dashboard/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  getUserProfileWithRole,
  getOrganizerDashboardStats,
  getEventsWithOrganizerInfo,
  clearCache,
} from "../../../lib/optimizedQueries";

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
  registration_count?: number | { count: number };
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

        // Use optimized query for user profile
        const profileData = await getUserProfileWithRole(userData.user.id);
        if (profileData) {
          setUser(profileData);
        }

        // Use optimized query for events with organizer info
        const eventsData = await getEventsWithOrganizerInfo({
          organizerId: userData.user.id,
          limit: 1000,
        });
        setEvents(eventsData as Event[]);

        // Use optimized query for dashboard stats
        const statsData = await getOrganizerDashboardStats(userData.user.id);
        setStats(statsData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserProfileAndEvents();
  }, [supabase]);

  const getActiveEvents = () => {
    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return event.status === "published" && eventDate > now;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Published";
      case "draft":
        return "Draft";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleCreateEvent = () => {
    router.push("/dashboard/organizer/events");
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/dashboard/organizer/events?edit=${eventId}`);
  };

  if (loading) {
    return (
      <DashboardLayout role="organizer">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="organizer">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name || "Organizer"}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your events today.
            </p>
          </div>
          <Button
            onClick={handleCreateEvent}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Create New Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                All time events created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRegistrations}
              </div>
              <p className="text-xs text-muted-foreground">
                Confirmed registrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageAttendanceRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
              <p className="text-xs text-muted-foreground">
                Currently published
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Your latest events and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No events created yet</p>
                  <Button onClick={handleCreateEvent} variant="outline">
                    Create Your First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {event.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{formatDate(event.date)}</span>
                          <span>•</span>
                          <span>{event.location}</span>
                          <span>•</span>
                          <span>
                            {typeof event.registration_count === "number"
                              ? event.registration_count
                              : event.registration_count?.count || 0}{" "}
                            registrations
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(
                            event.status
                          )}`}
                        >
                          {getEventStatusText(event.status)}
                        </span>
                        <div className="flex space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEvent(event.id)}
                              >
                                View
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View event details</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEvent(event.id)}
                              >
                                Edit
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit event</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                  {events.length > 5 && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push("/dashboard/organizer/events")
                        }
                      >
                        View All Events
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
              <CardDescription>Your upcoming events this month</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
                disabled={(date) => {
                  const activeEvents = getActiveEvents();
                  return !activeEvents.some(
                    (event) =>
                      new Date(event.date).toDateString() ===
                      date.toDateString()
                  );
                }}
                modifiers={{
                  event: (date) => {
                    const activeEvents = getActiveEvents();
                    return activeEvents.some(
                      (event) =>
                        new Date(event.date).toDateString() ===
                        date.toDateString()
                    );
                  },
                }}
                modifiersStyles={{
                  event: {
                    backgroundColor: "#8b5cf6",
                    color: "white",
                  },
                }}
              />
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Upcoming Events:</h4>
                <div className="space-y-2">
                  {getActiveEvents()
                    .slice(0, 3)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{event.name}</span>
                        <span className="text-gray-500">
                          {formatDate(event.date)} at {formatTime(event.date)}
                        </span>
                      </div>
                    ))}
                  {getActiveEvents().length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No upcoming events scheduled
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your events and view insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/organizer/events")}
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-lg">📅</span>
                <span>Manage Events</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/organizer/attendees")}
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-lg">👥</span>
                <span>View Attendees</span>
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/dashboard/organizer/announcements")
                }
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-lg">📢</span>
                <span>Send Announcements</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
