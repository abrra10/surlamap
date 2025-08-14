import { Metadata } from "next";
import HomePage from "./home/HomePage";

export const metadata: Metadata = {
  title: "Surlamap - Discover Amazing Events in Your City",
  description:
    "Find and join the best events in your local community. From music and sports to business and culture, discover what's happening around you.",
  keywords:
    "events, local events, community events, event discovery, event management",
  openGraph: {
    title: "Surlamap - Discover Amazing Events",
    description: "Find and join the best events in your local community",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Static generation - no dynamic data
export const dynamic = "force-static";
export const revalidate = 86400; // 24 hours

export default function Page() {
  return <HomePage />;
}
