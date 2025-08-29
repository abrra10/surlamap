"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type CreateEventData = {
  name: string;
  description: string;
  date: string;
  location: string;
  category: string;
  price: number;
  capacity: number;
  image_url?: string | null;
  status?: string;
  event_type?: string;
  meeting_link?: string;
};

export async function createEvent(formData: CreateEventData) {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be logged in to create an event");
    }

    // Validate required fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.date ||
      !formData.location ||
      !formData.category
    ) {
      throw new Error("Please fill in all required fields");
    }

    // Validate date is in the future
    const eventDate = new Date(formData.date);
    const now = new Date();
    if (eventDate <= now) {
      throw new Error("Event date must be in the future");
    }

    // Create the event
    const { data, error } = await supabase
      .from("events")
      .insert({
        name: formData.name,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        category: formData.category,
        price: formData.price || 0,
        capacity: formData.capacity || 0,
        image_url: formData.image_url || null,
        status: formData.status || "draft",
        event_type: formData.event_type || "in_person",
        meeting_link: formData.meeting_link || null,
        organizer_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create event. Please try again.");
    }

    // Revalidate the events page to show the new event
    revalidatePath("/dashboard/organizer/events");

    return { success: true, eventId: data.id };
  } catch (error) {
    console.error("Error in createEvent:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}

export async function updateEventStatus(eventId: string, status: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be logged in to update an event");
    }

    const { error } = await supabase
      .from("events")
      .update({ status })
      .eq("id", eventId)
      .eq("organizer_id", user.id); // Ensure user owns the event

    if (error) {
      throw new Error("Failed to update event status");
    }

    revalidatePath("/dashboard/organizer/events");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event",
    };
  }
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be logged in to delete an event");
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("organizer_id", user.id); // Ensure user owns the event

    if (error) {
      throw new Error("Failed to delete event");
    }

    revalidatePath("/dashboard/organizer/events");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event",
    };
  }
}
