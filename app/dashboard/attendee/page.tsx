"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function AttendeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

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

  // Compute stats and event dates
  const { totalAttended, totalUpcoming, eventDates, eventDateMap } =
    useMemo(() => {
      const now = new Date();
      let attended = 0;
      let upcoming = 0;
      let dates: Date[] = [];
      let dateMap: Record<string, string[]> = {};
      registeredEvents.forEach((reg) => {
        const event = reg.events;
        if (!event || !event.date) return;
        const eventDate = new Date(event.date);
        dates.push(eventDate);
        const key = eventDate.toDateString();
        if (!dateMap[key]) dateMap[key] = [];
        dateMap[key].push(event.name || event.title || "Event");
        if (eventDate < now) attended++;
        else upcoming++;
      });
      return {
        totalAttended: attended,
        totalUpcoming: upcoming,
        eventDates: dates,
        eventDateMap: dateMap,
      };
    }, [registeredEvents]);

  // Custom DayButton for Calendar with Tooltip
  function DayButtonWithTooltip(props: any) {
    const { day, modifiers, ...rest } = props;
    const key = day.date.toDateString();
    const isMarked = modifiers.marked;
    const eventNames = eventDateMap[key];
    if (isMarked && eventNames && eventNames.length > 0) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <CalendarDayButton {...props} />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>
            {eventNames.length === 1 ? (
              eventNames[0]
            ) : (
              <ul className="list-disc pl-4">
                {eventNames.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }
    return <CalendarDayButton {...props} />;
  }
  // Import the original CalendarDayButton
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { CalendarDayButton } = require("@/components/ui/calendar");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading...</h2>
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="attendee">
      <div className="flex flex-col gap-8">
        {/* Top row: stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Events Attended</CardTitle>
              <CardDescription>All past events you've attended</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-700">
                {totalAttended}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events you are going to attend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-700">
                {totalUpcoming}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Second row: calendar and CTA side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 w-full flex flex-col items-center justify-center">
            <Card className="w-full max-w-xl">
              <CardHeader>
                <CardTitle>Your Event Calendar</CardTitle>
                <CardDescription>
                  See your registered events at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="multiple"
                  selected={eventDates}
                  modifiers={{ marked: eventDates }}
                  modifiersClassNames={{ marked: "bg-blue-200 text-blue-900" }}
                  showOutsideDays
                  className="mx-auto"
                  components={{ DayButton: DayButtonWithTooltip }}
                />
              </CardContent>
            </Card>
          </div>
          <div className="w-full flex flex-col items-center justify-center">
            <Card className="bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200 w-full">
              <CardHeader>
                <CardTitle>Discover More Events</CardTitle>
                <CardDescription>
                  Find and register for new events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full mt-2"
                  onClick={() => router.push("/events")}
                >
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
