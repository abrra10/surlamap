"use client";

import React from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";

export default function ContactPage() {
  return (
    <section className="bg-[#f2fae6] min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Description Section */}
        <div className="text-center -mb-8">
          <div className="font-montserrat uppercase text-sm font-semibold tracking-widest mb-4 text-gray-700">
            We'd Love to Hear from You
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 min-h-[80vh]">
          {/* Left Column - Heading centered vertically */}
          <div className="flex flex-col justify-center lg:col-span-1">
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-extrabold text-[#201e36] leading-tight italic relative z-10">
                Get in Touch
              </h1>
              <svg
                width="1438"
                height="288"
                viewBox="0 0 1438 288"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-4xl absolute -top-12 left-0 z-0 opacity-80"
              >
                <path
                  d="M1078.12 149.024C953.702 131.613 403.466 206.443 288.534 284.236C288.534 287.94 289.829 288.161 291.407 287.94C304.624 286.088 531.437 229.938 695.68 210.888C748.896 204.715 806.987 200.05 861.756 191.254C916.526 182.459 1078.12 149.024 1078.12 149.024Z"
                  fill="#B8BDF2"
                />
                <path
                  d="M1437.56 38.26C1437.56 38.26 1438.71 39.0011 1437.28 42.7056C1436.51 43.2022 1433.54 45.6689 1426.07 50.1142C1415.15 59.0049 979.98 39.0674 728.435 73.0817L3.50264 161.248C-3.20042 161.973 1.77866 154.951 1.77866 154.951C94.8449 116.998 190.267 76.7868 443.404 49.0039C616.952 23.0846 939.939 -1.82545 1006 0.105409C1104.55 0.105409 1314.43 18.1258 1437.56 38.26Z"
                  fill="#B8BDF2"
                />
              </svg>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="flex flex-col justify-center lg:col-span-2">
            <div className="bg-[#201e36] rounded-2xl overflow-hidden shadow-lg p-10">
              {/* Contact Form */}
              <form className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-[#bfc3f7] font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your Name"
                    required
                    className="rounded-full border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-[#bfc3f7] font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    required
                    className="rounded-full border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="message"
                    className="text-[#bfc3f7] font-medium"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Type your message..."
                    className="rounded-2xl border-[#bfc3f7] focus:border-[#201e36] focus:ring-[#201e36] bg-white resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-[#bfc3f7] text-[#201e36] font-semibold hover:bg-[#aab3e6] rounded-full py-3 text-lg transition-colors duration-200"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
