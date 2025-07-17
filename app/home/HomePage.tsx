import React from "react";
import Hero from "./sections/Hero";
import CategoriesSection from "./sections/CategoriesSection";
import HowToSection from "./sections/HowToSection";
import NewsletterSection from "./sections/NewsletterSection";

const HomePage = () => {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <HowToSection />
      <NewsletterSection />
    </>
  );
};

export default HomePage;
