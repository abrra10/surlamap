"use client";

import React from "react";
import Image from "next/image";

export default function TeamSection() {
  return (
    <section className="bg-[#201e36] min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 min-h-[80vh]">
          {/* Left Column - Team Card */}
          <div className="flex flex-col justify-center lg:col-span-2">
            <div className="bg-[#bfc3f7] rounded-full p-12 md:p-18">
              <div className="px-6 md:px-8">
                <p className="text-base font-body font-bold md:text-xl text-center text-[#201e36] leading-relaxed max-w-2xl mb-8">
                  We're a small but passionate team, dedicated to building a
                  platform that helps people connect and share experiences.
                  We're always open to collaborations, eager for feedback, and
                  committed to make the app better for our community with every
                  step.
                </p>
              </div>

              {/* Team Member Card */}
              <div className="flex justify-center ">
                <div className="bg-[#f2fae6] rounded-full p-3 shadow-lg">
                  <div className="flex items-center gap-4">
                    {/* Taha's Image */}
                    <div className="w-18 h-18 rounded-full overflow-hidden">
                      <Image
                        src="/images/team/Taha.jpg"
                        alt="Taha Benacer"
                        width={72}
                        height={72}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Name with LinkedIn Link */}
                    <a
                      href="https://www.linkedin.com/in/taha-benacer-392192206/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold text-[#201e36] hover:text-[#bfc3f7] transition-colors duration-200 cursor-pointer"
                    >
                      Taha Benacer
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Heading centered vertically */}
          <div className="flex flex-col justify-center lg:col-span-1">
            <div className="relative">
              <h2 className="text-5xl md:text-7xl font-extrabold text-[#f2fae6] leading-tight italic relative z-10">
                The Team
              </h2>
              <svg
                width="1200"
                height="550"
                viewBox="0 0 1785 814"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-4xl absolute -top-60 -left-2 z-0 opacity-80"
              >
                <path
                  d="M13.1247 609.695C173.43 984.841 1713.79 791.281 1778.97 443.074C1881.69 -105.677 480.178 -55.7909 280.419 123.8C273.02 130.452 274.231 142.739 280.419 140.097C821.76 -91.0439 1807.76 54.9575 1724.23 443.074C1627.91 738.734 49.7354 950.253 43.3373 543.179C39.1247 275.152 745.695 22.6973 1256.82 103.181C1272.11 99.8548 1260.08 85.312 1243.32 82.228C695.222 -3.6655 -107.852 251.773 13.1247 609.695Z"
                  fill="#B8BDF2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
