"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import AuthButtons from "./AuthButtons";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
      alert("An unexpected error occurred during logout.");
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
    setIsMobileMenuOpen(false);
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

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        <AuthButtons />
      </div>

      {/* Mobile Hamburger Menu - CSS-based for hydration safety */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-800 hover:text-gray-600 transition-colors w-6 h-6 flex flex-col justify-center space-y-1"
          aria-label="Toggle mobile menu"
        >
          <span className="w-full h-0.5 bg-current transition-all duration-300"></span>
          <span className="w-full h-0.5 bg-current transition-all duration-300"></span>
          <span className="w-full h-0.5 bg-current transition-all duration-300"></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Close button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-4 mb-8">
                <Link
                  href="/"
                  className="font-subheading font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/events"
                  className="font-subheading font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Events
                </Link>
                <Link
                  href="/about"
                  className="font-subheading font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="font-subheading font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>

              {/* Auth Section - Only show for guests */}
              {!loading && !user && (
                <div className="mt-auto">
                  <div className="space-y-4">
                    <Link
                      href="/login"
                      className="block font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-[#9fa8f7] text-white font-semibold rounded-xl px-6 py-2 hover:bg-[#8c98e8]">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* User Section - Only show for logged in users */}
              {!loading && user && (
                <div className="mt-auto">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Welcome, {profile?.full_name || "User"}
                    </div>
                    <button
                      onClick={handleDashboardClick}
                      className="w-full text-left font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
