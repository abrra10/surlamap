"use client";

import React, { useState } from "react";

const FAQ_TABS = ["General", "Events", "Organizers", "Community"] as const;
type Tab = (typeof FAQ_TABS)[number];

const FAQS: Record<Tab, { question: string; answer: string }[]> = {
  General: [
    {
      question: "What is Surlamap?",
      answer:
        "Surlamap is a community-driven platform that connects people through local events. Whether you're looking to discover exciting activities in your area or want to organize events that bring neighbors together, we provide the tools and community to make it happen.",
    },
    {
      question: "How do I get started with Surlamap?",
      answer:
        "Getting started is easy! Simply create an account, browse events in your area, and start attending. If you want to organize events, you can upgrade to an organizer account and begin creating memorable experiences for your community.",
    },
    {
      question: "Is Surlamap free to use?",
      answer:
        "Yes! Attending events and browsing our platform is completely free. We offer premium features for organizers who want to create more impactful events and reach larger audiences.",
    },
    {
      question: "How do you ensure event safety?",
      answer:
        "We take event safety seriously. All events are reviewed by our team, and we encourage community reporting. We also provide safety guidelines and best practices for both organizers and attendees.",
    },
  ],
  Events: [
    {
      question: "What types of events can I find on Surlamap?",
      answer:
        "You'll find everything from sports and fitness activities to cultural events, professional networking, food festivals, music concerts, workshops, and community gatherings. Our diverse event categories ensure there's something for everyone.",
    },
    {
      question: "How do I find events near me?",
      answer:
        "Use our location-based search to discover events in your area. You can filter by category, date, distance, and price. We also send personalized recommendations based on your interests and past attendance.",
    },
    {
      question: "Can I get a refund if I can't attend an event?",
      answer:
        "Refund policies vary by event organizer. Most events offer refunds up to 24-48 hours before the event. Check the specific event details for the organizer's refund policy.",
    },
    {
      question: "How do I know if an event is legitimate?",
      answer:
        "All events on our platform are verified by our team. We also have a rating and review system where attendees can share their experiences, helping you make informed decisions.",
    },
  ],
  Organizers: [
    {
      question: "How do I become an event organizer?",
      answer:
        "Sign up for an organizer account and complete our verification process. Once approved, you can start creating events, managing registrations, and building your community.",
    },
    {
      question: "What tools do you provide for organizers?",
      answer:
        "We offer comprehensive event management tools including registration forms, attendee lists, payment processing, marketing tools, analytics, and promotional support to help your events succeed.",
    },
    {
      question: "How much does it cost to organize events?",
      answer:
        "We offer flexible pricing plans for organizers. Basic event creation is free, with premium features available for a small fee. Contact us for detailed pricing information.",
    },
    {
      question: "Can I promote my events on social media?",
      answer:
        "Absolutely! We provide social media integration and promotional tools to help you reach more people. You can also use our built-in marketing features to boost event visibility.",
    },
  ],
  Community: [
    {
      question: "How can I contribute to the Surlamap community?",
      answer:
        "You can contribute by attending events, leaving reviews, suggesting new event categories, participating in community discussions, and even organizing events yourself. Every interaction helps build a stronger local community.",
    },
    {
      question: "Do you have community guidelines?",
      answer:
        "Yes, we have clear community guidelines that promote respect, inclusivity, and positive interactions. We're committed to creating a safe and welcoming environment for all users.",
    },
    {
      question: "How do you handle community feedback?",
      answer:
        "We actively listen to our community feedback and use it to improve our platform. You can submit suggestions through our feedback form, and we regularly update features based on user input.",
    },
    {
      question: "Can I volunteer at Surlamap events?",
      answer:
        "Many organizers welcome volunteers for their events. Look for volunteer opportunities in event descriptions, or reach out to organizers directly to offer your help.",
    },
  ],
};

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full flex flex-col items-center py-20 px-4 bg-white">
      <h2 className="text-3xl md:text-4xl font-extrabold text-[#201e36] text-center mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-base md:text-lg text-[#8ca1a6] text-center mb-8 max-w-xl">
        Everything you need to know about Surlamap and how we're building
        stronger communities.
      </p>

      {/* Tabs */}
      <div className="flex justify-center mb-8 w-full max-w-2xl border-b border-[#e3e8f0]">
        {FAQ_TABS.map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 px-4 text-base font-medium text-[#201e36] transition border-b-2 ${
              activeTab === tab
                ? "border-[#bfc3f7] text-[#201e36]"
                : "border-transparent text-[#8ca1a6] hover:text-[#201e36]"
            }`}
            onClick={() => {
              setActiveTab(tab);
              setOpenIndex(null);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {FAQS[activeTab].map((faq, idx) => (
          <div
            key={faq.question}
            className={`rounded-xl border transition shadow-sm ${
              openIndex === idx
                ? "border-[#bfc3f7] bg-[#f2fae6]"
                : "border-[#e3e8f0] bg-white"
            }`}
          >
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <span className="text-lg font-bold text-[#201e36]">
                {faq.question}
              </span>
              <span className="text-2xl text-[#bfc3f7]">
                {openIndex === idx ? "×" : "+"}
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-5 text-[#23223a] text-base animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
