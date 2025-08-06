import React from "react";
import { Button } from "../../../components/ui/button";
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
    <section className="w-full bg-[#201e36] py-16 px-4">
      <h2 className="font-fugaz text-5xl font-extrabold text-[#f2fae6] text-center mb-12 italic">
        What to do this week?
      </h2>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12">
        {/* Left: 2x2 Category Grid and Button */}
        <div className="flex-1 flex flex-col items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 mb-8 w-full">
            {categories.map((item, i) => (
              <div key={i} className="flex flex-col items-start">
                {item.icon}
                <span className="font-montserrat text-2xl font-bold text-[#bfc3f7] mb-2">
                  {item.title}
                </span>
                <span className="font-body text-lg text-[#8ca1a6]">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
          <Link href="/events" className="w-full">
            <Button className="font-montserrat bg-[#bfc3f7] text-gray-900 font-bold px-10 py-8 text-xl hover:bg-[#aab3e6] mt-4 flex items-center gap-3 rounded-full w-full">
              Find More{" "}
              <IconArrowRight
                size={30}
                style={{ width: "30px", height: "30px" }}
              />
            </Button>
          </Link>
        </div>
        {/* Right: Figma-style Image Grid */}
        <div className="relative w-[600px] h-[520px] hidden md:block">
          {/* Top left (tall) - Conference */}
          <div
            className="absolute left-0 top-0 w-[290px] h-[310px] rounded-lg overflow-hidden shadow-md bg-gray-200"
            style={{ marginTop: "20px" }}
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
            className="absolute left-0 top-[350px] w-[290px] h-[170px] rounded-lg overflow-hidden shadow-md bg-gray-200"
            style={{ marginTop: "20px" }}
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
            className="absolute left-[310px] top-0 w-[290px] h-[170px] rounded-lg overflow-hidden shadow-md bg-gray-200"
            style={{ marginTop: "-20px" }}
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
            className="absolute left-[310px] top-[190px] w-[290px] h-[310px] rounded-lg overflow-hidden shadow-md bg-gray-200"
            style={{ marginTop: "-20px" }}
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
    </section>
  );
};

export default CategoriesSection;
