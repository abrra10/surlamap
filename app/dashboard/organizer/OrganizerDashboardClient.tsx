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
  ChevronLeft,
  ChevronRight,
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
  totalEvents?: number;
  activeEvents?: number;
  totalRegistrations: number;
  averageAttendanceRate?: number;
  confirmedRegistrations?: number;
  upcomingEvents?: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 2; // Show only 2 events per page to avoid scroll

  // Compute active events
  const activeEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return event.status === "published" && eventDate > now;
    });
  }, [events]);

  // Calculate pagination
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
    router.push(`/dashboard/organizer/events`);
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
          <h2 className="text-2xl font-semibold font-montserrat text-[#201e36]">
            Welcome back, {user?.full_name || "Organizer"}!
          </h2>
          <p className="text-[#201e36]/70 font-marcellus">
            Here's what's happening with your events
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
              {stats.totalEvents || 0}
            </div>
            <p className="text-xs text-[#201e36]/60 font-marcellus">
              {stats.activeEvents || 0} active events
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#bfc3f7]/20 hover:border-[#bfc3f7]/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-montserrat text-[#201e36]">
              Total Registrations
            </CardTitle>
            <Users className="h-6 w-6 text-[#bfc3f7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-montserrat text-[#201e36]">
              {stats.totalRegistrations}
            </div>
            <p className="text-xs text-[#201e36]/60 font-marcellus">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#bfc3f7]/20 hover:border-[#bfc3f7]/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-montserrat text-[#201e36]">
              Confirmed Events
            </CardTitle>
            <TrendingUp className="h-6 w-6 text-[#bfc3f7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-montserrat text-[#201e36]">
              {(stats.averageAttendanceRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-[#201e36]/60 font-marcellus">
              % of events with confirmed registrations
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
              {stats.activeEvents || 0}
            </div>
            <p className="text-xs text-[#201e36]/60 font-marcellus">
              Currently published
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
            Your latest events and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border border-[#bfc3f7]/20 rounded-lg hover:border-[#bfc3f7]/40 transition-colors"
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
                    <h3 className="font-semibold font-montserrat text-[#201e36]">
                      {event.name}
                    </h3>
                    <p className="text-sm text-[#201e36]/70 font-marcellus">
                      {formatDate(event.date)} at {formatTime(event.date)}
                    </p>
                    <p className="text-sm text-[#201e36]/70 font-marcellus">
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
                  <span className="text-sm text-[#201e36]/70 font-marcellus">
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
                      className="border-[#bfc3f7] text-[#201e36] hover:bg-[#bfc3f7] hover:text-[#201e36]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 border-[#bfc3f7] text-[#201e36] hover:bg-[#bfc3f7] hover:text-[#201e36]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 border-[#bfc3f7] text-[#201e36] hover:bg-[#bfc3f7] hover:text-[#201e36]"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
