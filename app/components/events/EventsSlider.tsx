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

type EventsSliderProps = {
  title: string;
  events: Event[];
  emptyMessage: string;
  userRole: string | null;
  user: any;
  registrations: { [eventId: string]: boolean };
  handleAttend: (event: Event) => void;
};

const EventsSlider: React.FC<EventsSliderProps> = ({
  title,
  events,
  emptyMessage,
  userRole,
  user,
  registrations,
  handleAttend,
}) => {
  if (events.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="font-fugaz text-3xl md:text-4xl font-extrabold mb-6 text-[#201e36] text-center">
          {title}
        </h2>
        <p className="font-body text-[#201e36] text-opacity-70 italic text-center">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Create unique navigation button classes based on title
  const sliderId = title.replace(/\s+/g, "-").toLowerCase();
  const prevButtonClass = `swiper-button-prev-${sliderId}`;
  const nextButtonClass = `swiper-button-next-${sliderId}`;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-fugaz text-3xl md:text-4xl font-extrabold text-[#201e36]">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            className={`bg-[#bfc3f7]  shadow-lg rounded-full p-2  ${prevButtonClass}`}
          >
            <IconChevronLeft className="w-5 h-5 text-[#201e36]" />
          </button>
          <button
            className={`bg-[#bfc3f7]  shadow-lg rounded-full p-2 ${nextButtonClass}`}
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
          speed={800}
          navigation={{
            nextEl: `.${nextButtonClass}`,
            prevEl: `.${prevButtonClass}`,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 32,
            },
          }}
          className={`events-swiper-${sliderId}`}
          style={{
            paddingBottom: "40px", // Space for pagination
          }}
        >
          {events.map((event) => (
            <SwiperSlide key={event.id}>
              <div className="h-full">
                <EventCard event={event} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default EventsSlider;
