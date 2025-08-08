import React from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import CircularText from "../../../components/ui/circular-text";

const NewsletterSection = () => {
  return (
    <section className="w-full bg-[#bfc3f7] py-16 px-4 flex flex-col items-center relative">
      {/* Circular text spanning between sections - hidden on mobile */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
        <div className="relative w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full bg-[#bfc3f7] flex items-center justify-center md:ml-6">
          <CircularText
            text=" Connect • Experience • Discover •"
            spinDuration={25}
            onHover="speedUp"
            className="text-[#201e36] font-montserrat font-bold"
          />
        </div>
      </div>

      <h2 className="font-fugaz text-3xl md:text-4xl font-extrabold text-[#201e36] text-center italic mb-4 mt-8 md:mt-12">
        Stay in the Loop
      </h2>
      <p className="font-montserrat text-lg text-[#201e36] text-center mb-8 max-w-xl">
        Subscribe to our newsletter and never miss an update on the latest
        events, features, and community news.
      </p>
      <form className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
        <Input
          type="email"
          placeholder="Enter your email"
          className="font-body flex-1 bg-white text-[#201e36] placeholder:text-[#aab3e6] border-none shadow-md"
          required
        />
        <Button
          type="submit"
          className="font-montserrat bg-[#201e36] text-[#bfc3f7] font-semibold px-8 py-2 text-lg hover:bg-[#23223a]"
        >
          Subscribe
        </Button>
      </form>
    </section>
  );
};

export default NewsletterSection;
