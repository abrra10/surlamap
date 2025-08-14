"use client";

import React, { useState } from "react";

const FAQ_TABS = ["General", "Billing", "Support", "Product"] as const;
type Tab = (typeof FAQ_TABS)[number];

const FAQS: Record<Tab, { question: string; answer: string }[]> = {
  General: [
    {
      question: "How long does a web design project take?",
      answer:
        "The timeline depends on the complexity and requirements of your project. Most projects are completed within 2-6 weeks.",
    },
    {
      question: "What factors affect the cost of web design?",
      answer:
        "Several factors influence the cost, including project scope, design complexity, required features, and timeline. We provide transparent quotes tailored to your needs.",
    },
    {
      question: "Do you provide ongoing support?",
      answer:
        "Yes, we offer ongoing support and maintenance packages to ensure your website remains up-to-date and secure.",
    },
    {
      question: "What is your web design process?",
      answer:
        "Our process includes discovery, planning, design, development, testing, and launch. We keep you informed at every stage.",
    },
  ],
  Billing: [
    {
      question: "How do I receive my invoice?",
      answer:
        "Invoices are sent via email and are also available in your account dashboard.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit cards, PayPal, and bank transfers.",
    },
  ],
  Support: [
    {
      question: "How can I contact support?",
      answer:
        "You can reach our support team via email or live chat on our website.",
    },
    {
      question: "What are your support hours?",
      answer: "Our support team is available Monday to Friday, 9am to 6pm.",
    },
  ],
  Product: [
    {
      question: "Can I upgrade my plan later?",
      answer:
        "Yes, you can upgrade or change your plan at any time from your account settings.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial for all new users.",
    },
  ],
};

export default function AboutPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      {/* Vision Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] py-16 bg-[#f2fae6]">
        {/* Centered Square Image */}
        <div className="flex justify-center mb-8">
          <img
            src="/images/logo.png"
            alt="Sur la map Logo"
            className="w-40 h-40 object-contain rounded-xl shadow-lg bg-white border"
          />
        </div>
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#201e36] leading-tight">
            Our Vision
          </h2>
          <p className="text-lg md:text-xl font-semibold text-[#201e36] mb-8">
            Sur la map is built on the belief that real connections happen when
            people come together in their local communities. Our mission is to
            make discovering, joining, and creating events effortless—so you can
            meet new people, try new things, and make memories that matter.
            Whether you're an organizer or an attendee, we empower you to shape
            your city's story, one event at a time.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full flex flex-col items-center py-20 px-4 bg-white">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#201e36] text-center mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-base md:text-lg text-[#8ca1a6] text-center mb-8 max-w-xl">
          Lorem ipsum dolor sit amet consectetur adipiscing eli mattis sit
          phasellus mollis sit aliquam sit nullam.
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
    </>
  );
}
