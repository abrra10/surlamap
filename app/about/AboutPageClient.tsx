"use client";

import VisionSection from "./VisionSection";
import TeamSection from "./TeamSection";
import FAQSection from "./FAQSection";
import SimpleNavigation from "../components/SimpleNavigation";
import SimpleFooter from "../components/SimpleFooter";

export default function AboutPageClient() {
  return (
    <>
      <SimpleNavigation />
      <main className="flex-1 flex flex-col">
        <VisionSection />
        <TeamSection />
        <FAQSection />
      </main>
      <SimpleFooter />
    </>
  );
}
