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

const footerLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/help", label: "Help Center" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/create-event", label: "Create Event" },
  { href: "/organizers", label: "For Organizers" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-[#bfc3f7] py-10 px-4 mt-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo placeholder */}
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <span className="font-montserrat text-[#201e36] text-sm">
            &copy; {new Date().getFullYear()} SurLaMap
          </span>
        </div>
        {/* Navigation links */}
        <nav className="flex flex-col items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-montserrat text-[#201e36] font-semibold hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-row items-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-montserrat text-[#201e36] text-sm hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        {/* Contact and Socials */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex items-center gap-2 text-[#201e36]">
            <IconMail size={20} />
            <span className="font-montserrat text-sm">
              contact@surlamap.com
            </span>
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
