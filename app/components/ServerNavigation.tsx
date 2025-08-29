"use client";

import Link from "next/link";
import Image from "next/image";

const ServerNavigation = () => {
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

      {/* Desktop Auth Buttons - Simple version without auth context */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
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
      </div>

      {/* Mobile Hamburger Menu - Simplified version */}
      <div className="md:hidden flex items-center">
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
      </div>
    </nav>
  );
};

export default ServerNavigation;
