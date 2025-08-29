import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="bg-[#f2fae6] relative flex flex-col items-center justify-center min-h-[80vh] md:py-22 py-16 overflow-hidden">
      {/* Background SVG Diamond */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-24">
          <svg
            width="100vw"
            height="940"
            viewBox="0 0 1618 940"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="min-w-[1618px]"
          >
            <path
              opacity="0.2"
              d="M1592.67 912.204C1395.16 735.303 1438.3 452.537 1255.26 412.326C1072.38 372.147 964.812 648.647 823.914 553.241C683.017 457.834 864.146 129.256 706.084 49.6504C548.022 -29.9553 215.282 308.245 25 137.821"
              stroke="url(#paint0_linear_36_135)"
              strokeWidth="74"
            />
            <defs>
              <linearGradient
                id="paint0_linear_36_135"
                x1="38.4881"
                y1="149.939"
                x2="1622"
                y2="951.41"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8395F9" />
                <stop offset="0.831731" stopColor="#8395F9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <div className="font-montserrat uppercase text-sm font-semibold tracking-widest mb-4 mt-8 text-gray-700">
          Welcome to your local scene
        </div>
        <h1
          className="font-fugaz text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 leading-tight tracking-tight"
          style={{
            textShadow: "0.5px 0 0 currentColor",
            letterSpacing: "-0.02em",
          }}
        >
          Meet <span className="italic">people</span>, try new{" "}
          <span className="italic">things</span>, <br />
          and make <span className="italic">memories</span> that <br />
          <span className="text-[#bfc3f7] italic">matter.</span>
        </h1>
        <p className="font-body text-lg md:text-xl font-semibold text-gray-800 mb-8">
          Whether you're exploring entertainment venues or expanding your
          professional network, sur la map plugs you into what makes your city
          tick. Join locals at lifestyle expos and sports events, or take the
          lead—design experiences that bring neighbors together and watch your
          community flourish.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/events">
            <Button className="font-subheading bg-[#bfc3f7] text-gray-900 font-semibold px-6 py-2 hover:bg-[#aab3e6]">
              Find Events
            </Button>
          </Link>
          <Link href="/events/create">
            <Button
              variant="outline"
              className="font-subheading border-[#bfc3f7] text-gray-900 font-semibold px-6 py-2"
            >
              Create Event
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
