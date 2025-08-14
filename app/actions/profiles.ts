"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { serverAuthOptimizations } from "@/lib/server-auth-optimizations";

// Get user profile
export async function getUserProfileAction() {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { data: null, error: "Authentication required" };
    }

    const profile = await serverAuthOptimizations.getOptimizedProfile(user.id);
    if (!profile) {
      return { data: null, error: "Profile not found" };
    }

    return { data: profile, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: null, error: "Internal server error" };
  }
}

// Update user profile
export async function updateProfileAction(profileData: {
  full_name?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
}) {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { data: null, error: "Authentication required" };
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return { data: null, error: "Failed to update profile" };
    }

    // Clear cache for this user
    serverAuthOptimizations.clearSessionCache(user.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attendee");
    revalidatePath("/dashboard/organizer");

    return { data: profile, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: null, error: "Internal server error" };
  }
}

// Get user dashboard stats
export async function getDashboardStatsAction() {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { data: null, error: "Authentication required" };
    }

    const profile = await serverAuthOptimizations.getOptimizedProfile(user.id);
    if (!profile) {
      return { data: null, error: "Profile not found" };
    }

    const supabase = await createClient();

    if (profile.role === "organizer") {
      // Organizer stats
      const { data: events } = await supabase
        .from("events")
        .select("id, status, date")
        .eq("organizer_id", user.id);

      const { data: registrations } = await supabase
        .from("registrations")
        .select("id, status")
        .in("event_id", events?.map((e) => e.id) || []);

      const totalEvents = events?.length || 0;
      const activeEvents =
        events?.filter(
          (e) => e.status === "published" && new Date(e.date) > new Date()
        ).length || 0;
      const totalRegistrations = registrations?.length || 0;
      const confirmedRegistrations =
        registrations?.filter((r) => r.status === "confirmed").length || 0;
      const averageAttendanceRate =
        totalRegistrations > 0
          ? (confirmedRegistrations / totalRegistrations) * 100
          : 0;

      return {
        data: {
          totalEvents,
          activeEvents,
          totalRegistrations,
          averageAttendanceRate,
          role: "organizer",
        },
        error: null,
      };
    } else {
      // Attendee stats
      const { data: registrations } = await supabase
        .from("registrations")
        .select(
          `
          id,
          status,
          events(id, name, date, status)
        `
        )
        .eq("attendee_id", user.id);

      const totalRegistrations = registrations?.length || 0;
      const confirmedRegistrations =
        registrations?.filter((r) => r.status === "confirmed").length || 0;
      const upcomingEvents =
        registrations?.filter(
          (r) =>
            r.status === "confirmed" &&
            r.events &&
            typeof r.events === "object" &&
            "status" in r.events &&
            "date" in r.events &&
            r.events.status === "published" &&
            new Date(r.events.date as string) > new Date()
        ).length || 0;

      return {
        data: {
          totalRegistrations,
          confirmedRegistrations,
          upcomingEvents,
          role: "attendee",
        },
        error: null,
      };
    }
  } catch (error) {
    console.error("Server action error:", error);
    return { data: null, error: "Internal server error" };
  }
}

// Get user's registered events
export async function getRegisteredEventsAction() {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { data: [], error: "Authentication required" };
    }

    const supabase = await createClient();

    const { data: registrations, error } = await supabase
      .from("registrations")
      .select(
        `
        id,
        status,
        created_at,
        events(
          id,
          name,
          description,
          date,
          location,
          category,
          event_type,
          price,
          image_url,
          organizer_id,
          profiles!events_organizer_id_fkey(full_name)
        )
      `
      )
      .eq("attendee_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching registered events:", error);
      return { data: [], error: "Failed to fetch registered events" };
    }

    // Transform the data to match the expected type
    const transformedData = (registrations || []).map((reg: any) => ({
      id: reg.id,
      status: reg.status,
      created_at: reg.created_at,
      events: reg.events
        ? {
            id: reg.events.id,
            name: reg.events.name,
            description: reg.events.description,
            date: reg.events.date,
            location: reg.events.location,
            category: reg.events.category,
            event_type: reg.events.event_type,
            price: reg.events.price,
            image_url: reg.events.image_url,
            organizer_id: reg.events.organizer_id,
            profiles: reg.events.profiles
              ? { full_name: reg.events.profiles.full_name }
              : null,
          }
        : null,
    }));

    return { data: transformedData, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: [], error: "Internal server error" };
  }
}

// Get user's created events (for organizers)
export async function getCreatedEventsAction() {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { data: [], error: "Authentication required" };
    }

    const profile = await serverAuthOptimizations.getOptimizedProfile(user.id);
    if (!profile || profile.role !== "organizer") {
      return { data: [], error: "Unauthorized" };
    }

    const supabase = await createClient();

    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        *,
        registration_count:registrations(count)
      `
      )
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false });

    // Transform registration_count to number
    const transformedEvents = (events || []).map((event: any) => ({
      ...event,
      registration_count: event.registration_count?.[0]?.count || 0,
    }));

    if (error) {
      console.error("Error fetching created events:", error);
      return { data: [], error: "Failed to fetch created events" };
    }

    return { data: transformedEvents, error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: [], error: "Internal server error" };
  }
}

// Get event attendees (for organizers)
export async function getEventAttendeesAction(eventId: string) {
  try {
    const user = await serverAuthOptimizations.getOptimizedUser();
    if (!user) {
      return { data: [], error: "Authentication required" };
    }

    const supabase = await createClient();

    // Verify event ownership
    const { data: event } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .single();

    if (!event || event.organizer_id !== user.id) {
      return { data: [], error: "Unauthorized" };
    }

    const { data: attendees, error } = await supabase
      .from("registrations")
      .select(
        `
        id,
        status,
        created_at,
        profiles!registrations_attendee_id_fkey(
          id,
          full_name,
          email,
          phone_number
        )
      `
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching event attendees:", error);
      return { data: [], error: "Failed to fetch event attendees" };
    }

    return { data: attendees || [], error: null };
  } catch (error) {
    console.error("Server action error:", error);
    return { data: [], error: "Internal server error" };
  }
}
