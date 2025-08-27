"use client";

import { createClient } from "@/utils/supabase/client";

// Cache for queries
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Clear expired cache
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      queryCache.delete(key);
    }
  }
};

// Get user profile with role
export const getUserProfileWithRole = async (userId: string) => {
  try {
    clearExpiredCache();
    
    const cacheKey = `profile_${userId}`;
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, email")
      .eq("id", userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    queryCache.set(cacheKey, { data: profile, timestamp: Date.now() });
    return profile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Search events with optimization
export const searchEvents = async (query: string, date?: Date) => {
  try {
    clearExpiredCache();
    
    const cacheKey = `search_${query}_${date?.toISOString() || 'no-date'}`;
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const supabase = createClient();
    let supabaseQuery = supabase
      .from("events")
      .select(`
        *,
        registration_count:registrations(count)
      `)
      .eq("status", "published")
      .gte("date", new Date().toISOString());
    
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      supabaseQuery = supabaseQuery
        .gte("date", startOfDay.toISOString())
        .lte("date", endOfDay.toISOString());
    }
    
    const { data, error } = await supabaseQuery
      .order("date", { ascending: true })
      .limit(20);
    
    if (error) {
      throw error;
    }
    
    // Transform registration_count to number
    const transformedData = data?.map((event: any) => ({
      ...event,
      registration_count: event.registration_count?.[0]?.count || 0,
    })) || [];
    
    queryCache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
    return transformedData;
  } catch (error) {
    console.error("Error searching events:", error);
    return [];
  }
};

// Clear cache for a specific user
export const clearCache = (userId: string) => {
  const keysToDelete: string[] = [];
  
  for (const key of queryCache.keys()) {
    if (key.includes(userId) || key.includes('search_')) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => queryCache.delete(key));
};

// Clear all cache
export const clearAllCache = () => {
  queryCache.clear();
};
