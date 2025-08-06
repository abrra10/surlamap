import React from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";

const Hero = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] py-16 bg-[#f2fae6] overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
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
          Meet <span className="italic">people</span>, <br /> try new{" "}
          <span className="italic">things</span>,
          <br />
          and make <span className="italic">memories</span> <br /> that{" "}
          <span className="text-[#bfc3f7] italic">matter.</span>
        </h1>
        <p className="font-body text-lg md:text-xl font-semibold text-gray-800 mb-8">
          Whether you're discovering your next favorite band or planning that
          neighborhood block party, sur la map connects you to your city's
          pulse. Join locals at pop-up markets and poetry nights, or become an
          organizer yourself—create events that bring people together and watch
          your community grow
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
