"use client";

import Link from "next/link";

const SimpleNavigation = () => {
  return (
    <nav
      className="w-full bg-[#bfc3f7] px-8 py-4 flex items-center justify-between relative"
      style={{ height: "72px" }}
    >
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-[#201e36]">Surlamap</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
        <Link href="/" className="font-semibold text-gray-800 hover:underline">
          Home
        </Link>
        <Link
          href="/events"
          className="font-semibold text-gray-800 hover:underline"
        >
          Events
        </Link>
        <Link
          href="/about"
          className="font-semibold text-gray-800 hover:underline"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="font-semibold text-gray-800 hover:underline"
        >
          Contact
        </Link>
      </div>

      {/* Auth Buttons - Simple version for now */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        <Link
          href="/login"
          className="text-gray-600 font-medium hover:underline"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="bg-[#9fa8f7] text-white font-semibold rounded-xl px-6 py-2 hover:bg-[#8c98e8]"
        >
          Sign up
        </Link>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center gap-4">
        <Link
          href="/login"
          className="text-gray-600 font-medium hover:underline"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="bg-[#9fa8f7] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#8c98e8] text-sm"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
};

export default SimpleNavigation;
