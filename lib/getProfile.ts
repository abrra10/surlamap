// lib/getProfile.ts
import { createClient } from "../utils/supabase/client";

export const getUserRole = async (userId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data?.role || null;
};
