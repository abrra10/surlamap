"use client";

import React from "react";
import Image from "next/image";
import { IconQuote } from "@tabler/icons-react";

export default function VisionSection() {
  return (
    <section className="bg-[#f2fae6] min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 min-h-[80vh]">
          {/* Left Column - Heading centered vertically */}
          <div className="flex flex-col justify-center lg:col-span-1">
            <div className="relative">
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#201e36] leading-tight italic relative z-10">
                Our Vision
              </h1>
              <svg
                width="9703"
                height="4815"
                viewBox="0 0 9703 4815"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -top-6 -left-6 z-0 opacity-40 w-96 h-28 md:w-[32rem] md:h-32"
              >
                <path
                  d="M635.459 2081.58C635.459 2081.58 1896.55 2402.81 3161.52 2291.27C3211.88 2291.27 3217.49 2512.52 3142.15 2527.73C1827.45 2793.12 49.1463 2749.92 25.253 2291.27C-1.86723 2264.5 -17.3647 1925.43 33.0016 1880.81C3184.77 2.53711 9587.09 -787.149 9699.45 1015.28C9852.49 2567.88 5019.26 3335.25 2034.09 4776.31C1582.73 4954.76 1668.21 4469.12 2003.09 4272.16C3827.25 3199.3 8887.78 2036.96 9416.62 979.588C8269.82 69.4445 4821.88 467.303 635.459 2081.58Z"
                  fill="#B8BDF2"
                />
              </svg>
            </div>
          </div>

          {/* Right Column - Card extending from right edge */}
          <div className="flex flex-col justify-center lg:col-span-2">
            <div className="bg-[#f8f9ff] rounded-tl-3xl rounded-bl-2xl overflow-hidden shadow-lg h-[300px] md:h-[500px] w-[120%] lg:-mr-[20%] lg:ml-auto">
              <div className="grid grid-cols-3 h-full">
                {/* Text - Takes up less width (1/3 of the card) */}
                <div className="col-span-1 bg-[#201e36] p-4 md:p-4 flex items-center relative">
                  <div className="absolute top-4 left-4 text-[#bfc3f7] opacity-60">
                    <IconQuote size={40} />
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
                  <div className="w-[500px] h-[400px] rounded-2xl overflow-hidden">
                    <img
                      className="w-full h-full object-contain"
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
