"use client";

import { AuthProvider } from "@/app/contexts/AuthContext";
import SimpleNavigation from "@/app/components/SimpleNavigation";
import SimpleFooter from "@/app/components/SimpleFooter";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SimpleNavigation />
      <main className="flex-1 flex flex-col">{children}</main>
      <SimpleFooter />
    </AuthProvider>
  );
}
