"use client";

import { useState, useEffect } from "react";
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
};

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
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

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };

    getUserProfile();
  }, [supabase]);

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
              {isOpen ? "←" : "→"}
            </button>
          </div>

          <nav className="mt-6">
            <ul>
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center px-4 py-3 hover:bg-gray-100"
                  >
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* User email and logout at the bottom */}
        <div className="p-4 border-t flex flex-col items-center gap-2">
          {user && (
            <>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                {isOpen && (
                  <span className="text-sm font-medium">{user.email}</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
