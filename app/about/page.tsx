import React from "react";
import { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About Surlamap - Connecting Communities Through Local Events",
  description:
    "Discover Surlamap's mission to transform how people discover, connect, and create meaningful experiences in their communities. Learn about our values, team, and impact.",
  keywords:
    "about surlamap, community events, local events, event discovery, community building, event platform, social connections, local community",
  openGraph: {
    title: "About Surlamap - Connecting Communities Through Local Events",
    description:
      "Discover Surlamap's mission to transform how people discover, connect, and create meaningful experiences in their communities.",
    type: "website",
  },
};

// Static generation - FAQ data is static
export const dynamic = "force-static";
export const revalidate = 604800; // 1 week

export default function AboutPage() {
  return <AboutPageClient />;
}
