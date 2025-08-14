// Next.js Optimization Utilities for Surlamap
import { cache } from "react";
import { createClient } from "../utils/supabase/server";
import { createStaticClient } from "../utils/supabase/server-static";

// Cache database queries for better performance
export const getCachedEvents = cache(async () => {
  const supabase = await createClient();
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
});

export const getCachedEvent = cache(async (eventId: string) => {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      *,
      registration_count:registrations(count),
      organizer:profiles!organizer_id(full_name, email)
    `
    )
    .eq("id", eventId)
    .single();

  return event;
});

// Image optimization utilities
export const optimizeImageUrl = (url: string, width: number = 400) => {
  if (!url) return "";

  // If it's already a Supabase storage URL, optimize it
  if (url.includes("supabase.co")) {
    return `${url}?width=${width}&quality=80`;
  }

  return url;
};

// Performance monitoring
export const measurePerformance = (name: string) => {
  if (typeof window !== "undefined") {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${name} took ${end - start}ms`);
    };
  }
  return () => {};
};

// SEO optimization
export const generateEventMetadata = (event: any) => {
  return {
    title: `${event.name} - Surlamap`,
    description: `${event.name} on ${new Date(
      event.date
    ).toLocaleDateString()} at ${
      event.location
    }. ${event.description?.substring(0, 150)}...`,
    openGraph: {
      title: event.name,
      description: event.description?.substring(0, 200),
      images: event.image_url ? [optimizeImageUrl(event.image_url, 1200)] : [],
      type: "event",
    },
  };
};

// Route optimization
export const generateStaticPaths = async () => {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("status", "published")
    .gte("date", new Date().toISOString());

  return (
    events?.map((event) => ({
      params: { id: event.id },
    })) || []
  );
};

// Bundle optimization
export const preloadCriticalResources = () => {
  if (typeof window !== "undefined") {
    // Preload critical CSS
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = "/globals.css";
    link.as = "style";
    document.head.appendChild(link);

    // Preload critical fonts
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.as = "style";
    document.head.appendChild(fontLink);
  }
};

// Memory optimization
export const cleanupEventListeners = (cleanup: () => void) => {
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }
  return () => {};
};

// Error boundary utilities
export const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);

  // Send to error tracking service in production
  if (process.env.NODE_ENV === "production") {
    // Add your error tracking service here
    // Example: Sentry.captureException(error);
  }
};

// Cache invalidation
export const invalidateCache = async (pattern: string) => {
  if (typeof window !== "undefined") {
    // Clear client-side cache
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.includes(pattern)) {
            return caches.delete(cacheName);
          }
        })
      );
    }
  }
};

// Static generation functions (for build time)
export const getStaticEvents = async () => {
  const supabase = await createStaticClient();
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("status", "published")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(100);

  return events || [];
};

export const getStaticEvent = async (eventId: string) => {
  const supabase = await createStaticClient();
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      *,
      registration_count:registrations(count),
      organizer:profiles!organizer_id(full_name, email)
    `
    )
    .eq("id", eventId)
    .single();

  return event;
};
