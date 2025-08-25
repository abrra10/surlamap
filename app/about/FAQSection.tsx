"use client";

import React, { useState } from "react";

const FAQ_TABS = ["General", "Events", "Organizers", "Community"] as const;
type Tab = (typeof FAQ_TABS)[number];

const FAQS: Record<Tab, { question: string; answer: string }[]> = {
  General: [
    {
      question: "What is Surlamap?",
      answer:
        "Surlamap is a community-driven platform that connects people through local events. Whether you're looking to discover exciting activities in your area or want to organize events, we provide the tools and community to make it happen.",
    },
    {
      question: "How do I get started with Surlamap?",
      answer:
        "Getting started is simple! Create an account and choose your role - either as an attendee to discover and join events, or as an organizer to create and manage events.",
    },
    {
      question: "Is Surlamap free to use?",
      answer:
        "Yes! Surlamap is completely free to use for both attendees and organizers. You can browse events, attend them, and even create your own events without any cost.",
    },
    {
      question: "How do you ensure event safety?",
      answer:
        "Event safety is the responsibility of individual organizers. Our mission is to connect people through events - we provide the platform for organizers to create events and for attendees to discover them. We encourage all users to use their best judgment when attending events.",
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
        "Use our search feature to discover events by location. As we grow our community and expand our event listings, we'll be adding more advanced filtering options to help you find exactly what you're looking for.",
    },
    {
      question: "Can I get a refund if I can't attend an event?",
      answer:
        "All events on Surlamap are currently free to attend, so there are no refunds needed. We don't allow paid events at this time - we're focused on building our community first and may introduce secure ticketing for paid events in the future.",
    },
    {
      question: "How do I know if an event is legitimate?",
      answer:
        "Our team stays in touch with organizers and verifies event details to ensure legitimacy.",
    },
  ],
  Organizers: [
    {
      question: "How do I become an event organizer?",
      answer:
        "Simply create an organizer account and you're ready to go! You'll get access to your organizer dashboard where you can manage all your events.",
    },
    {
      question: "What tools do you provide for organizers?",
      answer:
        "We provide an organizer dashboard with a complete overview of your events. You can create, edit, delete, publish/unpublish events, and manage announcements all from one place.",
    },
    {
      question: "How much does it cost to organize events?",
      answer:
        "Creating and organizing events is completely free! Since we expect all events to be free for attendees, there's no cost for organizers either.",
    },
    {
      question: "Can I promote my events on social media?",
      answer:
        "Yes! Every published event on our platform is automatically promoted on our social media channels, giving your events free exposure to reach more people.",
    },
  ],
  Community: [
    {
      question: "How can I contribute to the Surlamap community?",
      answer:
        "You can contribute by attending events, leaving reviews, suggesting new event categories, participating in community discussions, and organizing events yourself. We also have a contact page where you can send us messages about any other ways you'd like to contribute. Every interaction helps build a stronger local community.",
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
      question: "What language should I use on the platform?",
      answer:
        "Our platform operates in English, and we encourage all users - both attendees and organizers - to use English when creating events, posting announcements, and communicating on the platform to ensure everyone can participate.",
    },
  ],
};

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full flex flex-col items-center py-22 px-4 py-6 bg-[#f2fae6]">
      <h2 className="text-5xl md:text-7xl  italic font-extrabold text-[#201e36] text-center mb-6">
        Frequently Asked Questions
      </h2>
      <p className="font-montserrat uppercase text-sm font-semibold tracking-widest mb-4 text-gray-700">
        EVERYTHING YOU NEED TO KNOW ABOUT SURLAMAP
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
              openIndex === idx ? " bg-[#9fa8f7] " : "bg-[#bfc3f7]  "
            }`}
          >
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <span className="text-lg font-bold text-[#201e36]">
                {faq.question}
              </span>
              <span className="text-2xl text-[#23223a]">
                {openIndex === idx ? "×" : "+"}
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-5 text-[#23223a] text-base font-montserrat animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
