import React from "react";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import {
  IconBriefcase,
  IconMusic,
  IconSalad,
  IconShirtSport,
  IconArrowRight,
} from "@tabler/icons-react";

const categories = [
  {
    icon: <IconBriefcase size={48} color="#bfc3f7" className="mb-2" />,
    title: "Conferences and Professional Events",
    desc: "Discover and attend professional gatherings, workshops, and networking opportunities.",
  },
  {
    icon: <IconMusic size={48} color="#bfc3f7" className="mb-2" />,
    title: "Music and Entertainment",
    desc: "Enjoy concerts, shows, and entertainment events happening near you.",
  },
  {
    icon: <IconSalad size={48} color="#bfc3f7" className="mb-2" />,
    title: "Food and Lifestyle",
    desc: "Explore food festivals, lifestyle expos, and culinary experiences.",
  },
  {
    icon: <IconShirtSport size={48} color="#bfc3f7" className="mb-2" />,
    title: "Sports and Fitness",
    desc: "Participate in sports events, fitness classes, and wellness activities.",
  },
];

const images = [
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
];

const CategoriesSection = () => {
  return (
    <section className="w-full bg-[#201e36] py-16 px-4">
      <h2 className="text-5xl font-extrabold text-[#f2fae6] text-center mb-12">
        What to do this week?
      </h2>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12">
        {/* Left: 2x2 Category Grid and Button */}
        <div className="flex-1 flex flex-col items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 mb-8 w-full">
            {categories.map((item, i) => (
              <div key={i} className="flex flex-col items-start">
                {item.icon}
                <span className="text-2xl font-bold text-[#bfc3f7] mb-2">
                  {item.title}
                </span>
                <span className="text-lg text-[#8ca1a6]">{item.desc}</span>
              </div>
            ))}
          </div>
          <Link href="/events">
            <Button className="bg-[#bfc3f7] text-gray-900 font-semibold px-8 py-3 text-lg hover:bg-[#aab3e6] mt-4 flex items-center gap-2">
              <IconArrowRight size={22} /> Find More
            </Button>
          </Link>
        </div>
        {/* Right: Figma-style Image Grid */}
        <div className="relative w-[550px] h-[470px] hidden md:block">
          {/* Top left (tall) */}
          <div className="absolute left-0 top-0 w-[266.56px] h-[286.05px] rounded-lg overflow-hidden shadow-md bg-gray-200">
            <img
              src={images[0]}
              alt="Category"
              className="object-cover w-full h-full"
            />
          </div>
          {/* Bottom left (short) */}
          <div className="absolute left-0 top-[311px] w-[266.56px] h-[158.91px] rounded-lg overflow-hidden shadow-md bg-gray-200">
            <img
              src={images[1]}
              alt="Category"
              className="object-cover w-full h-full"
            />
          </div>
          {/* Top right (short) */}
          <div className="absolute left-[283px] top-0 w-[266.56px] h-[158.91px] rounded-lg overflow-hidden shadow-md bg-gray-200">
            <img
              src={images[2]}
              alt="Category"
              className="object-cover w-full h-full"
            />
          </div>
          {/* Bottom right (tall) */}
          <div className="absolute left-[283px] top-[183px] w-[266.56px] h-[286.05px] rounded-lg overflow-hidden shadow-md bg-gray-200">
            <img
              src={images[3]}
              alt="Category"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
