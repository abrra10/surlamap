"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { serverAuthOptimizations } from "@/lib/server-auth-optimizations";

// Get events with registration counts
export async function getEventsAction(
  filters: {
    status?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}
) {
  try {
    const supabase = await createClient();

    let query = supabase.from("events").select(`
        *,
        registration_count:registrations(count)
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq("status", filters.status);
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

    const { data: events, error } = await query
      .order("date", { ascending: true })
      .limit(filters.limit || 100);

    if (error) {
      console.error("Error fetching events:", error);
      return { data: [], error: "Failed to fetch events" };
    }

    return { data: events || [], error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: [], error: "Internal server error" };
  }
}

// Get single event with details
export async function getEventAction(eventId: string) {
  try {
    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from("events")
      .select(
        `
        *,
        registration_count:registrations(count),
        registrations(
          id,
          attendee_id,
          status,
          created_at,
          profiles(full_name, email)
        )
      `
      )
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return { data: null, error: "Event not found" };
    }

    return { data: event, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: null, error: "Internal server error" };
  }
}

// Create new event
export async function createEventAction(eventData: {
  name: string;
  description: string;
  date: string;
  location: string;
  category: string;
  event_type: string;
  price: number;
  capacity: number;
  image_url?: string;
}) {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { data: null, error: "Authentication required" };
    }

    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        ...eventData,
        organizer_id: user.id,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return { data: null, error: "Failed to create event" };
    }

    revalidatePath("/dashboard/organizer");
    revalidatePath("/events");

    return { data: event, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: null, error: "Internal server error" };
  }
}

// Update event
export async function updateEventAction(
  eventId: string,
  eventData: Partial<{
    name: string;
    description: string;
    date: string;
    location: string;
    category: string;
    event_type: string;
    price: number;
    capacity: number;
    image_url: string;
    status: string;
  }>
) {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { data: null, error: "Authentication required" };
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: existingEvent } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .single();

    if (!existingEvent || existingEvent.organizer_id !== user.id) {
      return { data: null, error: "Unauthorized" };
    }

    const { data: event, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return { data: null, error: "Failed to update event" };
    }

    revalidatePath("/dashboard/organizer");
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");

    return { data: event, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: null, error: "Internal server error" };
  }
}

// Delete event
export async function deleteEventAction(eventId: string) {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: existingEvent } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .single();

    if (!existingEvent || existingEvent.organizer_id !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return { success: false, error: "Failed to delete event" };
    }

    revalidatePath("/dashboard/organizer");
    revalidatePath("/events");

    return { success: true, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { success: false, error: "Internal server error" };
  }
}

// Register for event
export async function registerForEventAction(eventId: string) {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const supabase = await createClient();

    // Check if already registered
    const { data: existingRegistration } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("attendee_id", user.id)
      .single();

    if (existingRegistration) {
      return { success: false, error: "Already registered for this event" };
    }

    // Check event capacity
    const { data: event } = await supabase
      .from("events")
      .select("capacity, registration_count:registrations(count)")
      .eq("id", eventId)
      .single();

    if (event && event.capacity && event.registration_count >= event.capacity) {
      return { success: false, error: "Event is at full capacity" };
    }

    const { error } = await supabase.from("registrations").insert({
      event_id: eventId,
      attendee_id: user.id,
      status: "confirmed",
    });

    if (error) {
      console.error("Error registering for event:", error);
      return { success: false, error: "Failed to register for event" };
    }

    revalidatePath("/dashboard/attendee");
    revalidatePath(`/events/${eventId}`);

    return { success: true, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { success: false, error: "Internal server error" };
  }
}

// Cancel event registration
export async function cancelRegistrationAction(eventId: string) {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("attendee_id", user.id);

    if (error) {
      console.error("Error canceling registration:", error);
      return { success: false, error: "Failed to cancel registration" };
    }

    revalidatePath("/dashboard/attendee");
    revalidatePath(`/events/${eventId}`);

    return { success: true, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { success: false, error: "Internal server error" };
  }
}
