import { Metadata } from "next";

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

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
