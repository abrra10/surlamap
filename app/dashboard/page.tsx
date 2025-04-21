"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Supabase client creation
import { getUserRole } from "@/lib/getProfile"; // Fetch user role

const DashboardRedirect = () => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Auth error:", error.message);
          setError("Authentication error. Please login again.");
          router.push("/login");
          return;
        }

        if (!data?.user) {
          console.log("No user found, redirecting to login");
          router.push("/login");
          return;
        }

        const userId = data.user.id;
        console.log("User ID:", userId);

        // Fetch the user role from the database
        const role = await getUserRole(userId);
        console.log("User role:", role);

        if (role === "attendee") {
          router.push("/dashboard/attendee");
        } else if (role === "organizer") {
          router.push("/dashboard/organizer");
        } else {
          console.error("Invalid or missing role:", role);
          setError("Role not found. Please contact support.");
          // Optionally redirect to an error page or stay on dashboard
        }
      } catch (err) {
        console.error("Error in dashboard redirect:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [router, supabase]); // Re-run the effect when router or supabase changes

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Loading your dashboard...
          </h2>
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-100 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">
          Redirecting to your dashboard...
        </h2>
      </div>
    </div>
  );
};

export default DashboardRedirect;
