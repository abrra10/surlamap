import React from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import Image from "next/image";

const NewsletterSection = () => {
  return (
    <section className="w-full bg-[#bfc3f7] py-16 px-4 flex flex-col items-center relative">
      {/* Logo spanning between sections */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-32 md:w-40 h-20 md:h-24 flex items-center justify-center">
          <Image
            src="/images/logo2.png"
            alt="Logo"
            width={120}
            height={80}
            className="w-20 h-16 md:w-[340px] md:h-[240px]"
          />
        </div>
      </div>

      <h2 className="font-fugaz text-3xl md:text-4xl font-extrabold text-[#201e36] text-center mb-4">
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
          className="flex-1 bg-white text-[#201e36] placeholder:text-[#aab3e6] border-none shadow-md"
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
