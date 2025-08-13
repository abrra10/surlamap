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
        <h2 className="text-2xl font-bold mb-6 text-[#201e36]">{title}</h2>
        <p className="text-gray-500 italic">{emptyMessage}</p>
      </div>
    );
  }

  // Create unique navigation button classes based on title
  const sliderId = title.replace(/\s+/g, "-").toLowerCase();
  const prevButtonClass = `swiper-button-prev-${sliderId}`;
  const nextButtonClass = `swiper-button-next-${sliderId}`;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-[#201e36]">{title}</h2>

      <div className="relative group px-12">
        {/* Custom Navigation Buttons */}
        <button
          className={`absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${prevButtonClass}`}
        >
          <IconChevronLeft className="w-5 h-5 text-[#201e36]" />
        </button>

        <button
          className={`absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${nextButtonClass}`}
        >
          <IconChevronRight className="w-5 h-5 text-[#201e36]" />
        </button>

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
                <EventCard
                  event={event}
                  userRole={userRole}
                  user={user}
                  registrations={registrations}
                  handleAttend={handleAttend}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default EventsSlider;
