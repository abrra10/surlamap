"use client";

import React, { useEffect, useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar, MapPin, User, Ticket, World } from "tabler-icons-react";
import { createClient } from "../../../utils/supabase/client";
import { useAuth } from "@/app/contexts/AuthContext";
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
  description?: string;
  event_type: string;
  meeting_link?: string;
  organizer_id?: string;
  registration_count?: number | { count: number };
};

type EventDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { id } = React.use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [organizerName, setOrganizerName] = useState("");
  const [similarEvents, setSimilarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);

        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (eventError) {
          console.error("Error fetching event:", eventError);
          return;
        }

        setEvent(eventData);

        // Fetch organizer info
        if (eventData.organizer_id) {
          const { data: organizerProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", eventData.organizer_id)
            .single();
          setOrganizerName(organizerProfile?.full_name || "");
        }

        // Fetch registration count
        const { count } = await supabase
          .from("registrations")
          .select("id", { count: "exact" })
          .eq("event_id", id)
          .eq("status", "confirmed");

        setRegistrationCount(count || 0);

        // Check if user is registered
        if (user && profile?.role === "attendee") {
          const { data: registration } = await supabase
            .from("registrations")
            .select("id")
            .eq("event_id", id)
            .eq("attendee_id", user.id)
            .eq("status", "confirmed")
            .single();

          setIsRegistered(!!registration);
        }

        // Fetch similar events
        const { data: similarEventsData } = await supabase
          .from("events")
          .select("id, name, date, location, image_url")
          .eq("category", eventData.category)
          .eq("status", "published")
          .neq("id", id)
          .order("date", { ascending: true })
          .limit(8);

        setSimilarEvents(similarEventsData || []);
      } catch (error) {
        console.error("Error loading event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user, profile?.role]);

  const handleRegister = async () => {
    if (!user || profile?.role !== "attendee") {
      router.push("/login");
      return;
    }

    if (!event) return;

    try {
      setIsRegistering(true);

      // Check if event is full
      if (event.seats !== null && registrationCount >= event.seats) {
        alert("No seats available for this event.");
        return;
      }

      // Check if already registered
      if (isRegistered) {
        alert("You are already registered for this event.");
        return;
      }

      // Register for the event
      const { error } = await supabase.from("registrations").insert({
        event_id: event.id,
        attendee_id: user.id,
        status: "confirmed",
        number_of_seats: 1,
      });

      if (error) {
        console.error("Registration failed:", error);
        alert("Failed to register: " + error.message);
        return;
      }

      setIsRegistered(true);
      setRegistrationCount((prev) => prev + 1);
      alert("You are now registered for this event!");
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleJoinMeeting = () => {
    if (event?.meeting_link) {
      window.open(event.meeting_link, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-2 md:px-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-96 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 rounded w-3/4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Event Not Found
        </h1>
        <p className="text-gray-600">
          The event you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // Format date and time
  const dateObj = event.date ? new Date(event.date) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString() : "";
  const timeStr = dateObj
    ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  // Determine type label
  const typeLabel = event.event_type === "online" ? "Online" : "In Person";

  // Calculate available seats
  const availableSeats =
    event.seats !== null ? event.seats - registrationCount : null;

  return (
    <div className="max-w-5xl mx-auto py-12 px-2 md:px-6">
      <Card className="flex flex-col md:flex-row min-h-[600px] md:min-h-[700px] w-full md:w-[900px] mx-auto shadow-2xl overflow-hidden">
        {/* Image section */}
        <div className="md:w-[45%] bg-gray-100 flex items-center justify-center p-8 md:p-10 min-h-[350px] md:min-h-full">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.name}
              className="object-cover w-[350px] h-[200px] md:w-[500px] md:h-[300px] rounded-xl shadow-lg border border-gray-200"
            />
          ) : (
            <div className="w-[350px] h-[200px] md:w-[500px] md:h-[300px] flex items-center justify-center text-gray-400 bg-gray-200 rounded-xl">
              No image
            </div>
          )}
        </div>

        {/* Details section */}
        <div className="flex-1 p-8 md:p-12 flex flex-col gap-6 justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-3 text-[#201e36]">
              {event.name}
            </h1>

            {organizerName && (
              <div className="flex items-center gap-2 text-base text-gray-700 mb-4">
                <User size={22} />
                <span>
                  Organized by{" "}
                  <span className="font-semibold">{organizerName}</span>
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6 text-gray-600 text-lg mb-4">
              <span className="flex items-center gap-2">
                <Calendar size={20} /> {dateStr} {timeStr && `at ${timeStr}`}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={20} /> {event.location}
              </span>
              <span className="flex items-center gap-2">
                {event.event_type === "online" ? (
                  <World size={20} />
                ) : (
                  <Ticket size={20} />
                )}{" "}
                {typeLabel}
              </span>
            </div>

            {event.description && (
              <p className="text-gray-700 text-base leading-relaxed mb-6">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {event.category && (
                <span className="bg-[#bfc3f7] text-[#201e36] px-3 py-1 rounded-full font-medium">
                  {event.category
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
              )}
              {event.price !== null && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  {event.price === 0 ? "Free" : `${event.price} DZD`}
                </span>
              )}
              {availableSeats !== null && (
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    availableSeats > 0
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {availableSeats > 0
                    ? `${availableSeats} seats available`
                    : "Event full"}
                </span>
              )}
              {registrationCount > 0 && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                  {registrationCount} registered
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {profile?.role === "attendee" ? (
              <Button
                onClick={handleRegister}
                disabled={
                  isRegistering ||
                  isRegistered ||
                  (availableSeats !== null && availableSeats <= 0)
                }
                className={`font-semibold py-3 text-lg ${
                  isRegistered
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : availableSeats !== null && availableSeats <= 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-[#bfc3f7] text-[#201e36] hover:bg-[#aab3e6]"
                }`}
              >
                {isRegistering
                  ? "Registering..."
                  : isRegistered
                  ? "✓ Registered"
                  : availableSeats !== null && availableSeats <= 0
                  ? "Event Full"
                  : "Register for Event"}
              </Button>
            ) : !user ? (
              <Button
                onClick={() => router.push("/login")}
                className="bg-[#bfc3f7] text-[#201e36] font-semibold hover:bg-[#aab3e6] py-3 text-lg"
              >
                Login to Register
              </Button>
            ) : (
              <Button
                disabled
                className="bg-gray-400 text-gray-600 font-semibold py-3 text-lg cursor-not-allowed"
              >
                Organizers cannot register
              </Button>
            )}

            {event.meeting_link && event.event_type === "online" && (
              <Button
                onClick={handleJoinMeeting}
                variant="outline"
                className="border-[#bfc3f7] text-[#201e36] hover:bg-[#bfc3f7]"
              >
                Join Meeting
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Similar Events Section */}
      {similarEvents && similarEvents.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#201e36] mb-8">
            Similar Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarEvents.map((similarEvent) => (
              <Card
                key={similarEvent.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/events/${similarEvent.id}`)}
              >
                <div className="h-48 bg-gray-200">
                  {similarEvent.image_url ? (
                    <img
                      src={similarEvent.image_url}
                      alt={similarEvent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#201e36] mb-2 line-clamp-2">
                    {similarEvent.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(similarEvent.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {similarEvent.location}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
