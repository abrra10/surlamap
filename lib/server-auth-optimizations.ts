"use server";

import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

// Cache for user data to avoid repeated database calls
const userCache = new Map<string, { user: any; timestamp: number }>();
const profileCache = new Map<string, { profile: any; timestamp: number }>();

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now();
  
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      userCache.delete(key);
    }
  }
  
  for (const [key, value] of profileCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      profileCache.delete(key);
    }
  }
};

// Get optimized user with caching
export const getOptimizedUser = cache(async () => {
  try {
    clearExpiredCache();
    
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    // Cache the user data
    userCache.set(user.id, { user, timestamp: Date.now() });
    
    return user;
  } catch (error) {
    console.error("Error getting optimized user:", error);
    return null;
  }
});

// Get optimized profile with caching
export const getOptimizedProfile = cache(async (userId: string) => {
  try {
    clearExpiredCache();
    
    // Check cache first
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.profile;
    }
    
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error || !profile) {
      return null;
    }
    
    // Cache the profile data
    profileCache.set(userId, { profile, timestamp: Date.now() });
    
    return profile;
  } catch (error) {
    console.error("Error getting optimized profile:", error);
    return null;
  }
});

// Clear session cache for a specific user
export const clearSessionCache = (userId: string) => {
  userCache.delete(userId);
  profileCache.delete(userId);
};

// Clear all cache
export const clearAllCache = () => {
  userCache.clear();
  profileCache.clear();
};

// Server auth optimizations object
export const serverAuthOptimizations = {
  getOptimizedUser,
  getOptimizedProfile,
  clearSessionCache,
  clearAllCache,
};
