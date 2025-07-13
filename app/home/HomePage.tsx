import React from "react";
import Hero from "../components/Hero";
import CategoriesSection from "../components/CategoriesSection";
import HowToSection from "../components/HowToSection";
import NewsletterSection from "../components/NewsletterSection";

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
