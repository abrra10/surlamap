// Authentication Optimization Utilities for Surlamap (Client-Side Only)
import { createClient } from "../utils/supabase/client";

// Cache for user sessions to reduce auth checks
const sessionCache = new Map<string, { user: unknown; timestamp: number }>();
const SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Optimized client-side auth functions
export const optimizedAuth = {
  // Pre-validate email format before sending to server
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Pre-validate password strength
  validatePassword: (
    password: string
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    if (password.length > 128) {
      errors.push("Password is too long");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Debounced login to prevent rapid requests
  debouncedLogin: (() => {
    let timeoutId: NodeJS.Timeout;
    return (email: string, password: string) => {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              reject(error);
            } else {
              // Cache the session
              if (data.user) {
                sessionCache.set(data.user.id, {
                  user: data.user,
                  timestamp: Date.now(),
                });
              }
              resolve(data);
            }
          } catch (err) {
            reject(err);
          }
        }, 300); // 300ms debounce
      });
    };
  })(),

  // Optimized signup with better error handling
  optimizedSignup: async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    address: string;
    role: string;
  }) => {
    const supabase = createClient();

    try {
      // Step 1: Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: userData.email,
          password: userData.password,
        }
      );

      if (signUpError || !authData.user) {
        throw signUpError || new Error("Failed to create user account");
      }

      // Step 2: Create profile (with retry logic)
      let profileError;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        const { error } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          address: userData.address,
          role: userData.role || "attendee",
        });

        if (!error) {
          break;
        }

        profileError = error;
        retries++;

        // Wait before retry (exponential backoff)
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }

      if (profileError) {
        // Clean up auth user if profile creation failed
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Cache the session
      sessionCache.set(authData.user.id, {
        user: authData.user,
        timestamp: Date.now(),
      });

      return authData;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  // Get cached session
  getCachedSession: (userId: string) => {
    const cached = sessionCache.get(userId);
    if (cached && Date.now() - cached.timestamp < SESSION_CACHE_DURATION) {
      return cached.user;
    }
    return null;
  },

  // Clear session cache
  clearSessionCache: (userId?: string) => {
    if (userId) {
      sessionCache.delete(userId);
    } else {
      sessionCache.clear();
    }
  },
};

// Error handling utilities
export const authErrorHandler = {
  // Map Supabase errors to user-friendly messages
  getErrorMessage: (error: unknown): string => {
    if (!error) return "An unexpected error occurred";

    const errorMessage =
      (error as { message?: string })?.message?.toLowerCase() || "";

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

  // Retry logic for network errors
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: unknown;

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

// Performance monitoring for auth operations
export const authPerformance = {
  trackAuthOperation: (operation: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.log(
        `Auth operation "${operation}" took ${duration.toFixed(2)}ms`
      );

      // Log slow operations
      if (duration > 2000) {
        console.warn(
          `Slow auth operation: ${operation} took ${duration.toFixed(2)}ms`
        );
      }
    };
  },
};
