"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const SimpleNavigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{
    id: string;
    role: string | null;
    full_name: string | null;
    email: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

  // Hydration-safe auth check
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (isMounted) {
          if (currentUser && !error) {
            setUser(currentUser);

            // Fetch profile data
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("id, role, full_name, email")
              .eq("id", currentUser.id)
              .single();

            if (profileError) {
              console.error("Profile fetch error:", profileError);
            } else {
              console.log("Profile data fetched:", profileData);
            }

            setProfile(profileData);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Auth check error:", error);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Fetch profile data
          supabase
            .from("profiles")
            .select("id, role, full_name, email")
            .eq("id", currentUser.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error("Profile fetch error in auth listener:", error);
              } else {
                console.log("Profile data updated:", data);
              }
              setProfile(data);
            });
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        alert("Failed to logout. Please try again.");
        return;
      }

      // Clear storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDashboardClick = () => {
    if (profile?.role === "organizer") {
      window.location.href = "/dashboard/organizer";
    } else if (profile?.role === "attendee") {
      window.location.href = "/dashboard/attendee";
    } else {
      window.location.href = "/dashboard";
    }
  };
  return (
    <nav
      className="w-full bg-[#bfc3f7] px-8 py-4 flex items-center justify-between relative"
      style={{ height: "72px" }}
    >
      {/* Left side: Logo */}
      <div className="flex items-center flex-shrink-0">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo1.png"
            alt="Surlamap Logo"
            width={400}
            height={120}
            className="h-34 w-auto -ml-6 object-contain md:h-[260px] md:w-[260px] md:-ml-10"
            priority
          />
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
        <Link
          href="/"
          className="font-subheading font-semibold text-gray-800 hover:underline"
        >
          Home
        </Link>
        <Link
          href="/events"
          className="font-subheading font-semibold text-gray-800 hover:underline"
        >
          Events
        </Link>
        <Link
          href="/about"
          className="font-subheading font-semibold text-gray-800 hover:underline"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="font-subheading font-semibold text-gray-800 hover:underline"
        >
          Contact
        </Link>
      </div>

      {/* Desktop Auth Section */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        {loading ? (
          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white text-[#201e36] font-semibold rounded-xl px-4 py-2 hover:bg-gray-50 border-gray-300"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#bfc3f7] flex items-center justify-center">
                    <span className="text-xs font-medium text-[#201e36]">
                      {profile?.full_name?.charAt(0) ||
                        profile?.email?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block">
                    {profile?.full_name?.split(" ")[0] ||
                      profile?.email ||
                      "User"}
                  </span>
                  <span className="text-gray-400">▼</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name?.split(" ")[0] ||
                    profile?.email ||
                    "User"}
                </p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <DropdownMenuItem onClick={handleDashboardClick}>
                <span className="text-sm">Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <span className="text-sm text-red-600">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link
              href="/login"
              className="text-gray-600 font-medium hover:underline"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#9fa8f7] text-white font-semibold rounded-xl px-6 py-2 hover:bg-[#8c98e8] inline-block"
            >
              Sign up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Auth Section */}
      <div className="md:hidden flex items-center">
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white text-[#201e36] font-semibold rounded-xl px-3 py-2 hover:bg-gray-50 border-gray-300"
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#bfc3f7] flex items-center justify-center">
                    <span className="text-xs font-medium text-[#201e36]">
                      {profile?.full_name?.charAt(0) ||
                        profile?.email?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                  <span className="text-gray-400">▼</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name?.split(" ")[0] ||
                    profile?.email ||
                    "User"}
                </p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <DropdownMenuItem onClick={handleDashboardClick}>
                <span className="text-sm">Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <span className="text-sm text-red-600">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link
              href="/login"
              className="text-gray-600 font-medium hover:underline mr-4"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#9fa8f7] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#8c98e8] text-sm inline-block"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default SimpleNavigation;
