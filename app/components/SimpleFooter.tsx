"use client";

import Link from "next/link";

const SimpleFooter = () => {
  return (
    <footer className="w-full bg-[#bfc3f7] py-10 px-4 mt-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Copyright */}
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <span className="text-[#201e36] text-sm">
            &copy; {new Date().getFullYear()} SurLaMap
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            <Link
              href="/"
              className="text-[#201e36] font-semibold hover:underline"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="text-[#201e36] font-semibold hover:underline"
            >
              Events
            </Link>
            <Link
              href="/about"
              className="text-[#201e36] font-semibold hover:underline"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-[#201e36] font-semibold hover:underline"
            >
              Contact
            </Link>
          </div>
        </nav>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <span className="text-[#201e36] text-sm">contact@surlamap.com</span>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
