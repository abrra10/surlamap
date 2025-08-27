"use client";

import React from "react";
import Image from "next/image";
import { IconQuoteFilled } from "@tabler/icons-react";

export default function VisionSection() {
  return (
    <section className="bg-[#f2fae6] min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-18 min-h-[80vh]">
          {/* Left Column - Heading centered vertically */}
          <div className="flex flex-col justify-center md:col-span-1">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#201e36] leading-tight italic relative z-10">
                Our Vision
              </h1>
              <svg
                width="1200"
                height="630"
                viewBox="0 0 2030 1065"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-4xl absolute -top-60 left-0 z-0 opacity-80"
              >
                <path
                  d="M132.947 460.413C132.947 460.413 396.785 531.463 661.433 506.793C671.97 506.793 673.142 555.73 657.38 559.093C382.328 617.792 10.282 608.238 5.28318 506.793C-0.390729 500.872 -3.63301 425.875 6.90431 416.005C666.297 0.561195 2005.75 -174.105 2029.26 224.564C2061.27 567.973 1050.1 737.703 425.559 1056.44C331.129 1095.91 349.012 988.497 419.075 944.932C800.712 707.633 1859.44 450.542 1970.09 216.669C1730.16 15.36 1008.8 103.36 132.947 460.413Z"
                  fill="#B8BDF2"
                />
              </svg>
            </div>
          </div>

          {/* Right Column - Card extending to right edge */}
          <div className="flex flex-col justify-center md:col-span-2">
            <div className="bg-[#201e36] rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[500px] w-full md:w-[calc(100%+4.5rem)] md:-mr-18">
              <div className="grid grid-cols-3 h-full">
                {/* Text - Takes up less width (1/3 of the card) */}
                <div className="col-span-1  p-4 md:p-4 flex items-center relative">
                  <div className="absolute top-4 left-4 text-[#bfc3f7] opacity-60">
                    <IconQuoteFilled size={40} />
                  </div>
                  <p className="text-base font-body md:text-xl text-[#bfc3f7] font-md leading-relaxed pl-6 relative z-10">
                    This app was created with the Algerian community in mind — a
                    space where people can discover events, connect with others,
                    and share meaningful experiences together. Each event is an
                    opportunity to meet new people, strengthen bonds, and enjoy
                    the richness of our community.
                  </p>
                </div>

                {/* Image - Takes up more width (2/3 of the card) */}
                <div className="col-span-2 relative bg-[#201e36] flex items-center justify-center">
                  <div className="w-full h-full p-4">
                    <img
                      className="w-full h-full object-contain rounded-lg"
                      src="/images/painting.webp"
                      alt="Surlamap Vision"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
