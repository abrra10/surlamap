"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
// Chart components will be implemented later
import {
  Users,
  Calendar as CalendarIcon,
  TrendingUp,
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  category: string;
  price: number;
  image_url: string | null;
  capacity: number;
  registration_count: number | { count: number };
};

type DashboardStats = {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  averageAttendanceRate: number;
  role: string;
};

interface OrganizerDashboardClientProps {
  user: any;
  stats: DashboardStats;
  events: Event[];
}

export default function OrganizerDashboardClient({
  user,
  stats,
  events,
}: OrganizerDashboardClientProps) {
  const router = useRouter();
  // Compute active events
  const activeEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return event.status === "published" && eventDate > now;
    });
  }, [events]);

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

  const getStatusColor = (status: string) => {
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

  const handleCreateEvent = () => {
    router.push("/dashboard/organizer/events/create");
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/dashboard/organizer/events/${eventId}/edit`);
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleManageAttendees = (eventId: string) => {
    router.push(`/dashboard/organizer/events/${eventId}/attendees`);
  };

  // Simple calendar without custom day button for now

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Welcome back, {user?.full_name || "Organizer"}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your events
          </p>
        </div>
        <Button onClick={handleCreateEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEvents} active events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageAttendanceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Currently published</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Your latest events and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.date)} at {formatTime(event.date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {typeof event.registration_count === "number"
                      ? event.registration_count
                      : event.registration_count?.count || 0}{" "}
                    registrations
                  </span>

                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageAttendees(event.id)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {events.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/organizer/events")}
              >
                View All Events
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
