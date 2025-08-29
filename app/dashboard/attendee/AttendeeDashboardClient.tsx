"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Calendar as CalendarIcon,
  TrendingUp,
  CalendarDays,
  Clock,
  MapPin,
  Eye,
  ExternalLink,
} from "lucide-react";

type RegisteredEvent = {
  id: string;
  status: string;
  created_at: string;
  events?: {
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
    meeting_link: string | null;
    profiles?: {
      full_name: string | null;
    } | null;
  } | null;
};

type User = {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
};

interface AttendeeDashboardClientProps {
  user: User;
  registeredEvents: RegisteredEvent[];
}

export default function AttendeeDashboardClient({
  user,
  registeredEvents,
}: AttendeeDashboardClientProps) {
  const router = useRouter();
  // Compute stats
  const { categoryStats } = useMemo(() => {
    const categories = new Set<string>();

    registeredEvents.forEach((reg) => {
      const event = reg.events;
      if (!event || !event.date) return;

      categories.add(event.category);
    });

    return {
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
    });
  };

  const getEventStatus = (dateString: string) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );

    if (eventDay.getTime() === today.getTime()) return "today";
    if (eventDate > now) return "upcoming";
    return "past";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "today":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "past":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  const thisWeekEvents = getThisWeekEvents();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold font-montserrat text-[#201e36]">
            Welcome back, {user?.full_name || "Attendee"}!
          </h2>
          <p className="text-[#201e36]/70 font-marcellus">
            Here&apos;s what&apos;s happening with your events
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-[#bfc3f7]/20 hover:border-[#bfc3f7]/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-montserrat text-[#201e36]">
              Total Events
            </CardTitle>
            <CalendarDays className="h-6 w-6 text-[#bfc3f7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-montserrat text-[#201e36]">
              {registeredEvents.length}
            </div>
            <p className="text-xs text-[#201e36]/60 font-marcellus">
              Events you&apos;ve registered for
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#bfc3f7]/20 hover:border-[#bfc3f7]/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-montserrat text-[#201e36]">
              This Week
            </CardTitle>
            <Clock className="h-6 w-6 text-[#bfc3f7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-montserrat text-[#201e36]">
              {thisWeekEvents.length}
            </div>
            <p className="text-xs text-[#201e36]/60 font-marcellus">
              Events coming up
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#bfc3f7]/20 hover:border-[#bfc3f7]/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-montserrat text-[#201e36]">
              Categories
            </CardTitle>
            <TrendingUp className="h-6 w-6 text-[#bfc3f7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-montserrat text-[#201e36]">
              {categoryStats.length}
            </div>
            <p className="text-xs text-[#201e36]/60 font-marcellus">
              Different event types
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#bfc3f7]/20 hover:border-[#bfc3f7]/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-montserrat text-[#201e36]">
              Active Events
            </CardTitle>
            <CalendarIcon className="h-6 w-6 text-[#bfc3f7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-montserrat text-[#201e36]">
              {
                registeredEvents.filter((reg) => {
                  const event = reg.events;
                  if (!event || !event.date) return false;
                  const eventDate = new Date(event.date);
                  return eventDate > new Date();
                }).length
              }
            </div>
            <p className="text-xs text-[#201e36]/60 font-marcellus">
              Upcoming events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="bg-white border-[#bfc3f7]/20">
        <CardHeader>
          <CardTitle className="font-montserrat text-[#201e36]">
            Recent Events
          </CardTitle>
          <CardDescription className="font-marcellus text-[#201e36]/70">
            Your latest registered events
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
                      <Image
                        src={event.image_url}
                        alt={event.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
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
