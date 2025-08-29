import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
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
    image: "/images/categories/conference.webp",
  },
  {
    icon: <IconMusic size={48} color="#bfc3f7" className="mb-2" />,
    title: "Music and Entertainment",
    desc: "Enjoy concerts, shows, and entertainment events happening near you.",
    image: "/images/categories/music.webp",
  },
  {
    icon: <IconSalad size={48} color="#bfc3f7" className="mb-2" />,
    title: "Food and Lifestyle",
    desc: "Explore food festivals, lifestyle expos, and culinary experiences.",
    image: "/images/categories/food.webp",
  },
  {
    icon: <IconShirtSport size={48} color="#bfc3f7" className="mb-2" />,
    title: "Sports and Fitness",
    desc: "Participate in sports events, fitness classes, and wellness activities.",
    image: "/images/categories/basketball.webp",
  },
];

const CategoriesSection = () => {
  return (
    <section className="w-full bg-[#201e36] py-16 md:py-18 px-4 relative">
      <h2 className=" text-3xl md:text-5xl font-extrabold text-[#bfc3f7] text-center mb-8 md:mb-12 italic">
        What to do this week?
      </h2>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Left: 2x2 Category Grid and Button */}
          <div className="flex-1 flex flex-col items-center md:items-start order-2 md:order-1 md:-mx-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10 mb-6 md:mb-8 w-full">
              {categories.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center md:items-start text-center md:text-left"
                >
                  {item.icon}
                  <span className="font-montserrat text-lg md:text-2xl font-bold text-[#bfc3f7] mb-2">
                    {item.title}
                  </span>
                  <span className="font-body text-sm md:text-lg text-[#d7dbcd]">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/events" className="w-full">
              <Button className="font-montserrat bg-[#bfc3f7] text-gray-900 font-bold px-6 md:px-10 py-6 md:py-8 text-lg md:text-xl hover:bg-[#aab3e6] mt-4 flex items-center gap-3 rounded-full w-full justify-center">
                Find More Events{" "}
                <IconArrowRight
                  size={24}
                  className="md:w-8 md:h-8"
                  style={{ width: "24px", height: "24px" }}
                />
              </Button>
            </Link>
          </div>
          {/* Right: Figma-style Image Grid */}
          <div className="relative w-full max-w-[350px] md:w-[500px] h-[300px] md:h-[520px] order-1 md:order-2 mb-8 mt-4 ml-12 md:mx-24 flex justify-center">
            {/* Top left (tall) - Conference */}
            <div
              className="absolute left-0 top-0 w-[130px] md:w-[240px] h-[160px] md:h-[310px] rounded-lg overflow-hidden shadow-md bg-gray-200"
              style={{ marginTop: "10px", marginLeft: "10px" }}
            >
              <Image
                src={categories[1].image}
                alt="Music and Entertainment"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Bottom left (short) - Music */}
            <div
              className="absolute left-0 top-[180px] md:top-[350px] w-[130px] md:w-[240px] h-[90px] md:h-[170px] rounded-lg overflow-hidden shadow-md bg-gray-200"
              style={{ marginTop: "10px", marginLeft: "10px" }}
            >
              <Image
                src={categories[0].image}
                alt="Conferences and Professional Events"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Top right (short) - Food */}
            <div
              className="absolute left-[150px] md:left-[260px] top-0 w-[130px] md:w-[240px] h-[90px] md:h-[170px] rounded-lg overflow-hidden shadow-md bg-gray-200"
              style={{ marginTop: "-10px", marginLeft: "10px" }}
            >
              <Image
                src={categories[2].image}
                alt="Food and Lifestyle"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Bottom right (tall) - Basketball */}
            <div
              className="absolute left-[150px] md:left-[260px] top-[100px] md:top-[190px] w-[130px] md:w-[240px] h-[160px] md:h-[310px] rounded-lg overflow-hidden shadow-md bg-gray-200"
              style={{ marginTop: "-10px", marginLeft: "10px" }}
            >
              <Image
                src={categories[3].image}
                alt="Sports and Fitness"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
