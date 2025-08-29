"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/bundle";

import EventCard from "../../events/EventCard";

type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  category: string;
  price: number;
  image_url: string | null;
  seats: number | null;
};

type User = {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
};

type CategorySliderProps = {
  category: string;
  events: Event[];
  userRole: string | null;
  user: User;
  registrations: { [eventId: string]: boolean };
  handleAttend: (event: Event) => void;
};

// Helper function to format category names for display
const formatCategoryName = (category: string) => {
  switch (category) {
    case "conferences_professional":
      return "Conferences & Professional Events";
    case "music_entertainment":
      return "Music & Entertainment";
    case "food_lifestyle":
      return "Food & Lifestyle";
    case "sports_fitness":
      return "Sports & Fitness";
    case "arts_culture":
      return "Arts & Culture";
    case "tech_innovation":
      return "Tech & Innovation";
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
};

const CategorySlider: React.FC<CategorySliderProps> = ({
  category,
  events,
}) => {
  if (events.length === 0) {
    return null; // Don't render empty categories
  }

  // Create unique navigation button classes based on category
  const sliderId = category.replace(/\s+/g, "-").toLowerCase();
  const prevButtonClass = `swiper-button-prev-${sliderId}`;
  const nextButtonClass = `swiper-button-next-${sliderId}`;

  const categoryName = formatCategoryName(category);

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className=" text-3xl md:text-4xl font-extrabold text-[#201e36] italic">
          {categoryName}
        </h2>
        <div className="flex items-center gap-2">
          <button
            className={`bg-[#bfc3f7] shadow-lg rounded-full p-2 ${prevButtonClass}`}
          >
            <IconChevronLeft className="w-5 h-5 text-[#201e36]" />
          </button>
          <button
            className={`bg-[#bfc3f7] shadow-lg rounded-full p-2 ${nextButtonClass}`}
          >
            <IconChevronRight className="w-5 h-5 text-[#201e36]" />
          </button>
        </div>
      </div>

      <div className="relative group px-6">
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 1.5,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          navigation={{
            prevEl: `.${prevButtonClass}`,
            nextEl: `.${nextButtonClass}`,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          className="category-swiper"
        >
          {events.map((event) => (
            <SwiperSlide key={event.id} className="!w-[300px]">
              <EventCard event={event} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CategorySlider;
