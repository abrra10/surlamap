import { Suspense } from "react";

import EventsClient from "./EventsClient";
import { getEventsWithRegistrationCounts } from "../../lib/optimizedQueries";
import { createStaticClient } from "../../utils/supabase/server-static";

// Revalidate every 5 minutes for fresh event data
export const revalidate = 300;

// Generate static params for better caching
export async function generateStaticParams() {
  return [];
}

// Pre-fetch events data at build time and revalidate
async function getEventsData() {
  try {
    const supabase = await createStaticClient();
    const { data: events } = await supabase
      .from("events")
      .select(
        `
        *,
        registration_count:registrations(count)
      `
      )
      .eq("status", "published")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(100);

    return events || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export default async function EventsPage() {
  // Pre-fetch events data
  const initialEvents = await getEventsData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Discover Amazing Events
          </h1>
        </div>

        <Suspense fallback={<EventsLoadingSkeleton />}>
          <EventsClient initialEvents={initialEvents} />
        </Suspense>
      </div>
    </div>
  );
}

function EventsLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
