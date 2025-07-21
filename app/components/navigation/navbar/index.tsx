import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import React from "react";
import AuthButtons from "./AuthButtons";

const Navbar = () => {
  return (
    <nav
      className="w-full bg-[#bfc3f7] px-8 py-4 flex items-center justify-between"
      style={{ minHeight: 72 }}
    >
      {/* Centered navigation links */}
      <div className="flex-1 flex justify-center gap-10">
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
      {/* Right side: Log in and Sign up */}
      <div className="flex items-center gap-4">
        <AuthButtons />
      </div>
    </nav>
  );
};

export default Navbar;
