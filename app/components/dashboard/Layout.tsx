"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  role: "attendee" | "organizer";
  user?: any; // Pass user data from server component
};

export default function DashboardLayout({
  children,
  role,
  user,
}: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Navigation items based on role
  const attendeeNavItems: NavItem[] = [
    { label: "Overview", href: "/dashboard/attendee" },
    { label: "Events", href: "/dashboard/attendee/events" },
    { label: "Announcements", href: "/dashboard/attendee/announcements" },
    { label: "Profile", href: "/dashboard/attendee/profile" },
  ];

  const organizerNavItems: NavItem[] = [
    { label: "Overview", href: "/dashboard/organizer" },
    { label: "My Events", href: "/dashboard/organizer/events" },
    { label: "Announcements", href: "/dashboard/organizer/announcements" },
    { label: "Profile", href: "/dashboard/organizer/profile" },
  ];

  const navItems = role === "attendee" ? attendeeNavItems : organizerNavItems;

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
      router.push("/login");
      router.refresh(); // Force a refresh to clear any cached state
    } catch (error) {
      console.error("Error signing out:", error);
      alert("An unexpected error occurred during logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 flex flex-col justify-between ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <div>
          <div className="p-4 flex justify-between items-center">
            <h2 className={`font-bold text-xl ${isOpen ? "block" : "hidden"}`}>
              {role === "attendee" ? "Attendee" : "Organizer"}
            </h2>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isOpen ? "justify-start" : "justify-center"
                    } ${"text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
                  >
                    {item.icon && (
                      <span className="mr-3 h-5 w-5">{item.icon}</span>
                    )}
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* User section */}
        <div className="p-4 border-t">
          {user && (
            <div className={`${isOpen ? "block" : "hidden"}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user.full_name?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`mt-3 w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors ${
              isOpen ? "justify-start" : "justify-center"
            }`}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {isOpen && (
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
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
