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
  const router = useRouter();
  const supabase = createClient();

  // Navigation items based on role
  const attendeeNavItems: NavItem[] = [
    { label: "Overview", href: "/dashboard/attendee" },
    { label: "Events", href: "/dashboard/attendee/events" },
    { label: "My Tickets", href: "/dashboard/attendee/tickets" },
    { label: "Profile", href: "/dashboard/attendee/profile" },
  ];

  const organizerNavItems: NavItem[] = [
    { label: "Overview", href: "/dashboard/organizer" },
    { label: "My Events", href: "/dashboard/organizer/events" },
    { label: "Attendees", href: "/dashboard/organizer/attendees" },
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
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

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {role === "attendee"
                ? "Attendee Dashboard"
                : "Organizer Dashboard"}
            </h1>
            {user && (
              <div className="flex items-center">
                <span className="mr-2">{user.email}</span>
                <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
