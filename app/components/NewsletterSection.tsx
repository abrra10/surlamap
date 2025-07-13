import React from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const NewsletterSection = () => {
  return (
    <section className="w-full bg-[#bfc3f7] py-16 px-4 flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-[#201e36] text-center mb-4">
        Stay in the Loop
      </h2>
      <p className="text-lg text-[#201e36] text-center mb-8 max-w-xl">
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
          className="bg-[#201e36] text-[#bfc3f7] font-semibold px-8 py-2 text-lg hover:bg-[#23223a]"
        >
          Subscribe
        </Button>
      </form>
    </section>
  );
};

export default NewsletterSection;
