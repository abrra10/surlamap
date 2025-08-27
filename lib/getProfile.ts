"use server";

import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

// Get user role with caching
export const getUserRole = cache(async (userId: string): Promise<string | null> => {
  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (error || !profile) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    return profile.role;
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return null;
  }
});

// Get user profile with caching
export const getUserProfile = cache(async (userId: string) => {
  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error || !profile) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
});
