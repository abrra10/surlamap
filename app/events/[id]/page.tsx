import React from "react";
import { Metadata } from "next";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar, MapPin, User, Ticket, World } from "tabler-icons-react";
import { createClient } from "../../../utils/supabase/server";
import {
  getCachedEvent,
  getStaticEvents,
  getStaticEvent,
} from "../../../lib/nextjs-optimizations";

// ISR - Incremental Static Regeneration
export const revalidate = 300; // 5 minutes

// Generate static params for all published events
export async function generateStaticParams() {
  try {
    const events = await getStaticEvents();
    return events.map((event: any) => ({
      id: event.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate metadata for each event
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const event = await getCachedEvent(id);

    if (!event) {
      return {
        title: "Event Not Found - Surlamap",
        description: "The requested event could not be found.",
      };
    }

    return {
      title: `${event.name} - Surlamap`,
      description: `${event.name} on ${new Date(
        event.date
      ).toLocaleDateString()} at ${
        event.location
      }. ${event.description?.substring(0, 150)}...`,
      keywords: `${event.name}, ${event.category}, events, ${event.location}`,
      openGraph: {
        title: event.name,
        description: event.description?.substring(0, 200),
        images: event.image_url ? [event.image_url] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: event.name,
        description: event.description?.substring(0, 200),
        images: event.image_url ? [event.image_url] : [],
      },
    };
  } catch (error) {
    return {
      title: "Event - Surlamap",
      description: "Event details",
    };
  }
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const event = await getCachedEvent(id);

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

    // Fetch organizer info
    let organizerName = "";
    if (event.organizer_id) {
      const supabase = await createClient();
      const { data: organizerProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", event.organizer_id)
        .single();
      organizerName = organizerProfile?.full_name || "";
    }

    // Format date and time
    const dateObj = event.date ? new Date(event.date) : null;
    const dateStr = dateObj ? dateObj.toLocaleDateString() : "";
    const timeStr = dateObj
      ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

    // Determine type label
    const typeLabel = event.event_type === "online" ? "Online" : "In Person";

    // Fetch similar events (same category, published, not this event)
    const supabase = await createClient();
    const { data: similarEvents } = await supabase
      .from("events")
      .select("id, name, date, location, image_url")
      .eq("category", event.category)
      .eq("status", "published")
      .neq("id", event.id)
      .order("date", { ascending: true })
      .limit(8);

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
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {event.category && (
                  <span className="bg-[#bfc3f7] text-[#201e36] px-3 py-1 rounded-full font-medium">
                    {event.category
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                )}
                {event.price !== null && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    ${event.price}
                  </span>
                )}
                {event.seats !== null && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {event.seats} seats available
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Button className="bg-[#bfc3f7] text-[#201e36] font-semibold hover:bg-[#aab3e6] py-3 text-lg">
                Register for Event
              </Button>
              {event.meeting_link && event.event_type === "online" && (
                <Button
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
                  className="overflow-hidden hover:shadow-lg transition-shadow"
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
  } catch (error) {
    console.error("Error loading event:", error);
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Error Loading Event
        </h1>
        <p className="text-gray-600">
          There was an error loading this event. Please try again later.
        </p>
      </div>
    );
  }
}
