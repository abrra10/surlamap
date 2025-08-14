import React from "react";
import { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About Surlamap - Our Vision and Mission",
  description:
    "Learn about Surlamap's mission to connect communities through local events. Discover our vision for making event discovery effortless.",
  keywords: "about surlamap, mission, vision, community events, local events",
  openGraph: {
    title: "About Surlamap - Our Vision and Mission",
    description:
      "Learn about Surlamap's mission to connect communities through local events",
    type: "website",
  },
};

// Static generation - FAQ data is static
export const dynamic = "force-static";
export const revalidate = 604800; // 1 week

export default function AboutPage() {
  return <AboutPageClient />;
}
