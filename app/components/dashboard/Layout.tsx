"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/client";
import {
  IconHome,
  IconCalendarEvent,
  IconBell,
  IconUser,
  IconLogout,
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
} from "@tabler/icons-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type User = {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  role: "attendee" | "organizer";
  user?: User; // Pass user data from server component
};

export default function DashboardLayout({
  children,
  role,
  user,
}: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

  // Navigation items based on role
  const attendeeNavItems: NavItem[] = [
    { label: "Overview", href: "/dashboard/attendee", icon: IconHome },
    {
      label: "Events",
      href: "/dashboard/attendee/events",
      icon: IconCalendarEvent,
    },
    {
      label: "Announcements",
      href: "/dashboard/attendee/announcements",
      icon: IconBell,
    },
    { label: "Profile", href: "/dashboard/attendee/profile", icon: IconUser },
  ];

  const organizerNavItems: NavItem[] = [
    { label: "Overview", href: "/dashboard/organizer", icon: IconHome },
    {
      label: "My Events",
      href: "/dashboard/organizer/events",
      icon: IconCalendarEvent,
    },
    {
      label: "Announcements",
      href: "/dashboard/organizer/announcements",
      icon: IconBell,
    },
    { label: "Profile", href: "/dashboard/organizer/profile", icon: IconUser },
  ];

  const navItems = role === "attendee" ? attendeeNavItems : organizerNavItems;

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLoggingOut(true);
      console.log("Logging out...");

      // Check if supabase client is properly initialized
      if (!supabase) {
        console.error("Supabase client not initialized");
        alert("Authentication service not available. Please refresh the page.");
        return;
      }

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className={`${isOpen ? "block" : "hidden"}`}>
            <h1 className="text-xl font-bold text-[#201e36] font-montserrat">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 font-marcellus">
              {role === "attendee" ? "Attendee" : "Organizer"} Portal
            </p>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Toggle button clicked, current state:", isOpen);
                setIsOpen(!isOpen);
              }}
              className="p-2 rounded-md hover:bg-[#bfc3f7] hover:text-[#201e36] transition-colors focus:outline-none z-10 relative text-gray-600"
              type="button"
            >
              {isOpen ? (
                <IconArrowNarrowLeft className="w-5 h-5" />
              ) : (
                <IconArrowNarrowRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-10 px-3">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        console.log("Navigation link clicked:", item.href);
                      }}
                      className={`flex items-center px-3 py-3 text-sm font-medium  rounded-lg transition-all duration-200 ${
                        isOpen ? "justify-start" : "justify-center"
                      } text-gray-600 hover:bg-[#bfc3f7] hover:text-[#201e36] group`}
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      {isOpen && (
                        <span className="ml-3 font-montserrat font-bold">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-gray-100">
          {user && (
            <div className={`${isOpen ? "block" : "hidden"}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-[#bfc3f7] flex items-center justify-center">
                    <span className="text-sm font-medium text-[#201e36] font-montserrat">
                      {user.full_name?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 font-montserrat">
                    {user.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 font-montserrat">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            type="button"
            aria-label={isLoggingOut ? "Logging out..." : "Logout"}
            className={`mt-4 w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
              isOpen ? "justify-start" : "justify-center"
            }`}
          >
            <IconLogout className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="ml-3 font-montserrat font-medium">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
