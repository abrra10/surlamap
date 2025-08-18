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
  Search,
  Clock,
  MapPin,
  Eye,
  ExternalLink,
  Heart,
} from "lucide-react";

type RegisteredEvent = {
  id: string;
  status: string;
  created_at: string;
  events: {
    id: string;
    name: string;
    description: string;
    date: string;
    location: string;
    category: string;
    event_type: string;
    price: number;
    image_url: string | null;
    organizer_id: string;
    meeting_link?: string;
    profiles: {
      full_name: string;
    } | null;
  } | null;
};

interface AttendeeDashboardClientProps {
  user: any;
  registeredEvents: RegisteredEvent[];
}

export default function AttendeeDashboardClient({
  user,
  registeredEvents,
}: AttendeeDashboardClientProps) {
  const router = useRouter();
  // Compute stats
  const { totalAttended, totalUpcoming, categoryStats } = useMemo(() => {
    const now = new Date();
    let attended = 0;
    let upcoming = 0;
    const categories = new Set<string>();

    registeredEvents.forEach((reg) => {
      const event = reg.events;
      if (!event || !event.date) return;

      const eventDate = new Date(event.date);
      categories.add(event.category);

      if (eventDate < now) attended++;
      else upcoming++;
    });

    return {
      totalAttended: attended,
      totalUpcoming: upcoming,
      categoryStats: Array.from(categories),
    };
  }, [registeredEvents]);

  // Helper functions for attendee-specific stats
  const getThisWeekEvents = () => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    return registeredEvents.filter((reg) => {
      const event = reg.events;
      if (!event || !event.date) return false;
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= endOfWeek;
    }).length;
  };

  const getNextEventDays = () => {
    const now = new Date();
    const upcomingEvents = registeredEvents
      .map((reg) => reg.events)
      .filter((event) => event && event.date && new Date(event.date) > now)
      .sort(
        (a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime()
      );

    if (upcomingEvents.length === 0) return "No";

    const nextEventDate = new Date(upcomingEvents[0]!.date);
    const diffTime = nextEventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 0 ? "Today" : diffDays.toString();
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

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    if (eventDateObj < now) return "past";
    if (eventDateObj.getTime() - now.getTime() < 24 * 60 * 60 * 1000)
      return "today";
    return "upcoming";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "today":
        return "bg-orange-100 text-orange-800";
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "past":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Welcome back, {user?.full_name || "Attendee"}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your events
          </p>
        </div>
        <Button
          onClick={() => router.push("/events")}
          className="flex items-center gap-2"
        >
          <CalendarDays className="h-4 w-4" />
          Browse Events
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registeredEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Total registered events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getThisWeekEvents()}</div>
            <p className="text-xs text-muted-foreground">Events this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Event</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getNextEventDays()}</div>
            <p className="text-xs text-muted-foreground">
              Days until next event
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.length}</div>
            <p className="text-xs text-muted-foreground">Event categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>
            Your registered events and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {registeredEvents.slice(0, 5).map((registration) => {
              const event = registration.events;
              if (!event) return null;

              const status = getEventStatus(event.date);

              return (
                <div
                  key={registration.id}
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Organized by {event.profiles?.full_name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        status
                      )}`}
                    >
                      {status === "today"
                        ? "Today"
                        : status === "upcoming"
                        ? "Upcoming"
                        : "Past"}
                    </span>

                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`/events/${event.id}`, "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {registeredEvents.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/attendee/events")}
              >
                View All Events
              </Button>
            </div>
          )}

          {registeredEvents.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by discovering and registering for events
              </p>
              <Button onClick={() => router.push("/events")}>
                Browse Events
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
