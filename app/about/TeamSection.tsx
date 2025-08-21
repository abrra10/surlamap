"use client";

import React from "react";

export default function TeamSection() {
  return (
    <section className="bg-[#201e36] min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 min-h-[80vh]">
          {/* Left Column - Team Card */}
          <div className="flex flex-col justify-center lg:col-span-2">
            <div className="bg-[#bfc3f7] rounded-full p-12 md:p-18">
              <p className="text-base font-body font-bold md:text-xl text-[#201e36] leading-relaxed max-w-2xl mb-8">
                We're a small but passionate team, dedicated to building a
                platform that helps people connect and share experiences. We're
                always open to collaborations, eager for feedback, and committed
                to make the app better for our community with every step.
              </p>

              {/* Team Member Card */}
              <div className="flex justify-center ">
                <div className="bg-[#f2fae6] rounded-full p-3 shadow-lg">
                  <div className="flex items-center gap-4">
                    {/* Avatar Placeholder */}
                    <div className="w-18 h-18 bg-[#201e36] rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#bfc3f7]">
                        TB
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-[#201e36]">
                      Taha Benacer
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Heading in bottom-right */}
          <div className="flex flex-col justify-end lg:col-span-1">
            <div className="mb-16">
              <h2 className="text-5xl md:text-7xl font-extrabold text-[#bfc3f7] leading-tight italic">
                Our Team
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
