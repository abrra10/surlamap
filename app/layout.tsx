import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
