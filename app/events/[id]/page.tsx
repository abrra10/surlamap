import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar, MapPin, User, Ticket, World } from "tabler-icons-react";
import { createClient } from "../../../utils/supabase/server";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-red-600">
        Error loading event: {error.message}
      </div>
    );
  }
  if (!event) {
    return <div className="max-w-5xl mx-auto py-10 px-4">Event not found.</div>;
  }

  // Fetch organizer info
  let organizerName = "";
  if (event.organizer_id) {
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
                <World size={20} /> {typeLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-2 mb-6">
              <span className="flex items-center gap-2 text-base">
                <Ticket size={20} />
                {event.seats !== null
                  ? `${event.seats} seats`
                  : "Unlimited seats"}
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-base font-semibold">
                {event.price === 0 ? "Free" : `${event.price} DZD`}
              </span>
            </div>
            <p className="mt-2 text-gray-800 text-lg leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
            {event.event_type === "online" && event.meeting_link && (
              <a
                href={event.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-base mt-4 inline-block"
              >
                Join Online Event
              </a>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <Button className="w-full md:w-auto text-lg px-8 py-4">
              Register Now
            </Button>
          </div>
        </div>
      </Card>
      {/* Similar Events Section */}
      {similarEvents && similarEvents.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-[#201e36]">
            Similar Events
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
            {similarEvents.map((ev) => {
              const evDate = ev.date ? new Date(ev.date) : null;
              const evDateStr = evDate ? evDate.toLocaleDateString() : "";
              return (
                <a
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="min-w-[220px] max-w-[220px] bg-white border rounded-xl shadow hover:shadow-lg transition flex-shrink-0 flex flex-col overflow-hidden"
                >
                  {ev.image_url ? (
                    <img
                      src={ev.image_url}
                      alt={ev.name}
                      className="object-cover w-full h-[120px]"
                    />
                  ) : (
                    <div className="w-full h-[120px] flex items-center justify-center text-gray-400 bg-gray-200">
                      No image
                    </div>
                  )}
                  <div className="p-3 flex flex-col gap-1">
                    <div className="font-semibold text-base truncate">
                      {ev.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {ev.location}
                    </div>
                    <div className="text-xs text-gray-500">{evDateStr}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
