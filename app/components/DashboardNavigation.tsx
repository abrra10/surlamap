"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/app/utils/supabase/client";

interface User {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
}

interface DashboardNavigationProps {
  user?: User;
}

const DashboardNavigation = ({ user }: DashboardNavigationProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

  // Fallback user data if not provided
  const userData = user || {
    id: "unknown",
    full_name: "User",
    email: "user@example.com",
    role: "attendee",
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Logging out...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        alert("Failed to logout. Please try again.");
        return;
      }

      console.log("Logout successful, redirecting to login...");

      // Clear any local storage or session storage if needed
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDashboardClick = () => {
    if (userData.role === "organizer") {
      window.location.href = "/dashboard/organizer";
    } else if (userData.role === "attendee") {
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

      {/* Desktop User Menu */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-white text-[#201e36] font-semibold rounded-xl px-4 py-2 hover:bg-gray-50 border-gray-300"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#bfc3f7] flex items-center justify-center">
                  <span className="text-xs font-medium text-[#201e36]">
                    {userData.full_name?.charAt(0) ||
                      userData.email?.charAt(0) ||
                      "U"}
                  </span>
                </div>
                <span className="hidden sm:block">
                  {userData.full_name?.split(" ")[0] || "User"}
                </span>
                <span className="text-gray-400">▼</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {userData.full_name?.split(" ")[0] || "User"}
              </p>
              <p className="text-xs text-gray-500">{userData.email}</p>
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
      </div>

      {/* Mobile User Menu */}
      <div className="md:hidden flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-white text-[#201e36] font-semibold rounded-xl px-3 py-2 hover:bg-gray-50 border-gray-300"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-[#bfc3f7] flex items-center justify-center">
                  <span className="text-xs font-medium text-[#201e36]">
                    {userData.full_name?.charAt(0) ||
                      userData.email?.charAt(0) ||
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
                {userData.full_name?.split(" ")[0] || "User"}
              </p>
              <p className="text-xs text-gray-500">{userData.email}</p>
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
      </div>
    </nav>
  );
};

export default DashboardNavigation;
