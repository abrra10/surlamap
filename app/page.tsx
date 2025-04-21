// app/page.tsx or app/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase]);

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-6">Welcome to SurLaMap</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Your one-stop platform for managing events and tracking attendees.
        </p>

        <div className="flex justify-center gap-4">
          {!loading && !user ? (
            <>
              <Link
                href="/signup"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Log In
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">For Attendees</h2>
          <p className="mb-4">
            Discover events, purchase tickets, and manage your bookings all in
            one place.
          </p>
          <Link
            href="/signup?role=attendee"
            className="text-blue-600 hover:underline"
          >
            Join as an Attendee →
          </Link>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">For Organizers</h2>
          <p className="mb-4">
            Create and manage events, sell tickets, and track attendance with
            powerful tools.
          </p>
          <Link
            href="/signup?role=organizer"
            className="text-purple-600 hover:underline"
          >
            Join as an Organizer →
          </Link>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Map Integration</h2>
          <p className="mb-4">
            Visualize event locations and find venues near you with our
            interactive map features.
          </p>
          <Link href="/about" className="text-green-600 hover:underline">
            Learn More →
          </Link>
        </div>
      </div>
    </main>
  );
}
