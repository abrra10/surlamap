import React from "react";
import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconMail,
} from "@tabler/icons-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-[#bfc3f7] py-10 px-4 mt-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo placeholder */}
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <div className="w-24 h-10 bg-[#201e36] rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2">
            Logo
          </div>
          <span className="text-[#201e36] text-sm">
            &copy; {new Date().getFullYear()} SurLaMap
          </span>
        </div>
        {/* Navigation links */}
        <nav className="flex flex-col md:flex-row items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#201e36] font-semibold hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Contact and Socials */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex items-center gap-2 text-[#201e36]">
            <IconMail size={20} />
            <span className="text-sm">contact@surlamap.com</span>
          </div>
          <div className="flex gap-4 mt-2">
            <a
              href="#"
              aria-label="Facebook"
              className="text-[#201e36] hover:text-[#23223a]"
            >
              <IconBrandFacebook size={24} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-[#201e36] hover:text-[#23223a]"
            >
              <IconBrandTwitter size={24} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="text-[#201e36] hover:text-[#23223a]"
            >
              <IconBrandInstagram size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
