"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Supabase client creation
import { getUserRole } from "@/lib/getProfile"; // Fetch user role

const DashboardRedirect = () => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data, error } = await supabase.auth.getUser(); // Await the result of getUser()

      if (error || !data?.user) {
        // If there's an error or no user is logged in, redirect to the login page
        router.push("/auth/login");
        return;
      }

      const userId = data.user.id; // Safely access user.id

      // Fetch the user role from the database
      const role = await getUserRole(userId);

      if (role === "attendee") {
        // Redirect to attendee dashboard
        router.push("/dashboard/attendee");
      } else if (role === "organizer") {
        // Redirect to organizer dashboard
        router.push("/dashboard/organizer");
      } else {
        // If no role is found or it's invalid, redirect to login
        router.push("/auth/login");
      }
    };

    checkRole();
  }, [router, supabase]); // Re-run the effect when router or supabase changes

  return null; // No UI needed for this component
};

export default DashboardRedirect;
