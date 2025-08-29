import { createClient } from "../utils/supabase/client";

// Cache for frequently accessed data
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data or fetch fresh data
async function getCachedOrFetch<T>(
  key: string,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const data = await fetchFunction();
  cache.set(key, { data, timestamp: now });
  return data;
}

// Optimized query to get events with registration counts in a single query
export async function getEventsWithRegistrationCounts(
  filters: {
    status?: string;
    organizerId?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}
) {
  const supabase = createClient();

  let query = supabase
    .from("events")
    .select(
      `
      *,
      registration_count:registrations!inner(count)
    `
    )
    .eq("registrations.status", "confirmed");

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.organizerId) {
    query = query.eq("organizer_id", filters.organizerId);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.dateFrom) {
    query = query.gte("date", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("date", filters.dateTo);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events with registration counts:", error);
    return [];
  }

  return data || [];
}

// Optimized query to get user profile with role in a single query
export async function getUserProfileWithRole(userId: string) {
  return getCachedOrFetch(`user_profile_${userId}`, async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  });
}

// Optimized query to get events with organizer info and registration counts
export async function getEventsWithOrganizerInfo(
  filters: {
    status?: string;
    organizerId?: string;
    limit?: number;
  } = {}
) {
  const supabase = createClient();

  let query = supabase
    .from("events")
    .select(
      `
      *,
      organizer:profiles!organizer_id(full_name, email),
      registration_count:registrations!inner(count)
    `
    )
    .eq("registrations.status", "confirmed");

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.organizerId) {
    query = query.eq("organizer_id", filters.organizerId);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.order("date", { ascending: false });

  if (error) {
    console.error("Error fetching events with organizer info:", error);
    return [];
  }

  return data || [];
}

// Optimized query to get user registrations with event details
export async function getUserRegistrationsWithEvents(userId: string) {
  return getCachedOrFetch(`user_registrations_${userId}`, async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("registrations")
      .select(
        `
        *,
        events(*)
      `
      )
      .eq("attendee_id", userId)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user registrations:", error);
      return [];
    }

    return data || [];
  });
}

// Optimized query to get organizer dashboard stats in a single query
export async function getOrganizerDashboardStats(organizerId: string) {
  return getCachedOrFetch(`organizer_stats_${organizerId}`, async () => {
    const supabase = createClient();

    // Get events with registration counts in one query
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        date,
        status,
        seats,
        registration_count:registrations!inner(count)
      `
      )
      .eq("organizer_id", organizerId)
      .eq("registrations.status", "confirmed");

    if (eventsError) {
      console.error("Error fetching organizer events:", eventsError);
      return {
        totalEvents: 0,
        totalRegistrations: 0,
        averageAttendanceRate: 0,
        activeEvents: 0,
      };
    }

    const events = eventsData || [];
    const now = new Date();

    let totalRegistrations = 0;
    let totalAttendanceRate = 0;
    let activeEvents = 0;
    let eventsWithRegistrations = 0;

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      const registrations =
        typeof event.registration_count === "number"
          ? event.registration_count
          : 0;

      // Check if event is active
      if (event.status === "published" && eventDate > now) {
        activeEvents++;
      }

      totalRegistrations += registrations;

      // Calculate attendance rate
      if (event.seats && event.seats > 0) {
        const attendanceRate = (registrations / event.seats) * 100;
        totalAttendanceRate += attendanceRate;
        eventsWithRegistrations++;
      }
    });

    const averageAttendanceRate =
      eventsWithRegistrations > 0
        ? Math.round((totalAttendanceRate / eventsWithRegistrations) * 100) /
          100
        : 0;

    return {
      totalEvents: events.length,
      totalRegistrations,
      averageAttendanceRate,
      activeEvents,
    };
  });
}

// Optimized query to get attendees for organizer's events
export async function getOrganizerAttendees(organizerId: string) {
  const supabase = createClient();

  // Get all events for this organizer with attendees in one query
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      date,
      location,
      category,
      price,
      image_url,
      attendees:registrations!inner(
        *,
        attendee:profiles!attendee_id(full_name, email)
      )
    `
    )
    .eq("organizer_id", organizerId)
    .eq("registrations.status", "confirmed")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching organizer attendees:", error);
    return {};
  }

  // Transform data to match expected format
  type Attendee = {
    id: string;
    full_name?: string;
    email?: string;
  };

  // Transform data to match expected format
  const attendeesByEvent: { [eventId: string]: Attendee[] } = {};
  data?.forEach((event) => {
    attendeesByEvent[event.id] = event.attendees || [];
  });

  return attendeesByEvent;
}

// Optimized query to get announcements with event and organizer info
export async function getAnnouncementsWithEventInfo(eventIds: string[]) {
  if (eventIds.length === 0) return [];

  const supabase = createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select(
      `
      *,
      events(name),
      organizer:profiles!organizer_id(full_name)
    `
    )
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  return data || [];
}

// Optimized search query with proper indexing hints
export async function searchEvents(searchTerm: string, dateFilter?: Date) {
  const supabase = createClient();

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("date", { ascending: true })
    .limit(10);

  if (searchTerm) {
    const escaped = searchTerm.replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.or(
      `name.ilike.%${escaped}%,location.ilike.%${escaped}%,category.ilike.%${escaped}%`
    );
  }

  if (dateFilter) {
    const dateStr = dateFilter.toISOString().split("T")[0];
    query = query.gte("date", dateStr).lt("date", `${dateStr}T23:59:59`);
  } else {
    // Default to upcoming events if no date specified
    const todayStr = new Date().toISOString().split("T")[0];
    query = query.gte("date", todayStr);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error searching events:", error);
    return [];
  }

  // Get registration counts for the found events
  if (data && data.length > 0) {
    const eventIds = data.map((event) => event.id);
    const { data: regData } = await supabase
      .from("registrations")
      .select("event_id")
      .in("event_id", eventIds)
      .eq("status", "confirmed");

    // Create a map of event_id to registration count
    const regCountMap: { [key: string]: number } = {};
    regData?.forEach((reg) => {
      regCountMap[reg.event_id] = (regCountMap[reg.event_id] || 0) + 1;
    });

    // Add registration counts to events
    const eventsWithCounts = data.map((event) => ({
      ...event,
      registration_count: regCountMap[event.id] || 0,
    }));

    return eventsWithCounts;
  }

  return data || [];
}

// Clear cache for specific user or all cache
export function clearCache(userId?: string) {
  if (userId) {
    cache.delete(`user_profile_${userId}`);
    cache.delete(`user_registrations_${userId}`);
    cache.delete(`organizer_stats_${userId}`);
  } else {
    cache.clear();
  }
}

// Preload critical data for better performance
export async function preloadCriticalData(userId: string) {
  try {
    await Promise.all([
      getUserProfileWithRole(userId),
      getUserRegistrationsWithEvents(userId),
      getOrganizerDashboardStats(userId),
    ]);
  } catch (error) {
    console.error("Error preloading critical data:", error);
  }
}
