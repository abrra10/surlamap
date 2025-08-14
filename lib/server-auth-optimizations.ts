// Server-Side Authentication Optimization Utilities for Surlamap
import { createClient } from "../utils/supabase/server";

// Cache for user sessions to reduce auth checks (server-side)
const sessionCache = new Map<string, { user: any; timestamp: number }>();
const SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Server-side auth optimizations
export const serverAuthOptimizations = {
  // Optimized server-side auth check
  getOptimizedUser: async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Cache the user session
      sessionCache.set(user.id, {
        user,
        timestamp: Date.now(),
      });

      return user;
    } catch (error) {
      console.error("Server auth error:", error);
      return null;
    }
  },

  // Get user profile with role (cached)
  getOptimizedProfile: async (userId: string) => {
    try {
      const supabase = await createClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error("Profile optimization error:", error);
      return null;
    }
  },

  // Get cached session (server-side)
  getCachedSession: (userId: string) => {
    const cached = sessionCache.get(userId);
    if (cached && Date.now() - cached.timestamp < SESSION_CACHE_DURATION) {
      return cached.user;
    }
    return null;
  },

  // Clear session cache (server-side)
  clearSessionCache: (userId?: string) => {
    if (userId) {
      sessionCache.delete(userId);
    } else {
      sessionCache.clear();
    }
  },
};

// Server-side error handling utilities
export const serverAuthErrorHandler = {
  // Map Supabase errors to user-friendly messages (server-side)
  getErrorMessage: (error: any): string => {
    if (!error) return "An unexpected error occurred";

    const errorMessage = error.message?.toLowerCase() || "";

    if (errorMessage.includes("invalid login credentials")) {
      return "Invalid email or password. Please try again.";
    }
    if (errorMessage.includes("email not confirmed")) {
      return "Please check your email and confirm your account.";
    }
    if (errorMessage.includes("user already registered")) {
      return "An account with this email already exists.";
    }
    if (errorMessage.includes("password should be at least")) {
      return "Password must be at least 6 characters long.";
    }
    if (errorMessage.includes("invalid email")) {
      return "Please enter a valid email address.";
    }
    if (errorMessage.includes("too many requests")) {
      return "Too many login attempts. Please wait a moment and try again.";
    }
    if (errorMessage.includes("network")) {
      return "Network error. Please check your connection and try again.";
    }

    return "An error occurred. Please try again.";
  },

  // Retry logic for network errors (server-side)
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on auth errors (invalid credentials, etc.)
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string" &&
          error.message.includes("invalid login credentials")
        ) {
          throw error;
        }

        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  },
};

// Server-side performance monitoring for auth operations
export const serverAuthPerformance = {
  trackAuthOperation: (operation: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.log(
        `Server auth operation "${operation}" took ${duration.toFixed(2)}ms`
      );

      // Log slow operations
      if (duration > 2000) {
        console.warn(
          `Slow server auth operation: ${operation} took ${duration.toFixed(
            2
          )}ms`
        );
      }
    };
  },
};
