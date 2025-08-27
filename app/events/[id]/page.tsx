import React from "react";
import { createClient } from "../../../utils/supabase/server";
import EventDetailsClient from "./EventDetailsClient";

type EventDetailsPageProps = {
  params: { id: string };
};

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { id } = params;
  const supabase = await createClient();

  // Fetch event details on the server
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 text-center">
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
    const { data: organizerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", event.organizer_id)
      .single();
    organizerName = organizerProfile?.full_name || "";
  }

  // Fetch registration count
  const { count: registrationCount } = await supabase
    .from("registrations")
    .select("id", { count: "exact" })
    .eq("event_id", id)
    .eq("status", "confirmed");

  // Fetch similar events
  const { data: similarEvents } = await supabase
    .from("events")
    .select("id, name, date, location, image_url")
    .eq("category", event.category)
    .eq("status", "published")
    .neq("id", id)
    .order("date", { ascending: true })
    .limit(8);

  return (
    <EventDetailsClient
      event={event}
      organizerName={organizerName}
      registrationCount={registrationCount || 0}
      similarEvents={similarEvents || []}
    />
  );
}
