import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import {
  IconCalendarEvent,
  IconMapPin,
  IconMap2,
  IconVideo,
  IconUsers,
  IconTag,
} from "@tabler/icons-react";
import Link from "next/link";

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

type Props = {
  event: Event;
  userRole: string | null;
  user: any;
  registrations: { [eventId: string]: boolean };
  handleAttend: (event: Event) => void;
};

function formatDateParts(dateStr: string) {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    full: date.toLocaleString(),
  };
}

const EventCard: React.FC<Props> = ({
  event,
  userRole,
  user,
  registrations,
  handleAttend,
}) => {
  // Determine type
  const isOnline =
    event.location.toLowerCase().includes("online") ||
    event.location.toLowerCase().includes("zoom");
  const typeLabel = isOnline ? "Online" : "In Person";
  // Seats
  const seatsLabel = event.seats === null ? "Unlimited" : event.seats;
  // Date parts
  const { day, month, full } = formatDateParts(event.date);

  return (
    <Card className="bg-[#fff] border shadow-lg overflow-hidden">
      <div className="relative">
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-50 object-cover"
          />
        )}
        {/* Date badge overlay */}
        <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded flex flex-col items-center px-2 py-1 shadow text-[#201e36]">
          <span className="text-lg font-bold leading-none">{day}</span>
          <span className="text-xs font-semibold uppercase tracking-widest">
            {month}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h2 className="text-lg font-bold mb-2 text-[#201e36]">{event.name}</h2>
        <div className="flex flex-col gap-1 mb-3">
          <span className="flex items-center text-sm text-[#8ca1a6]">
            <IconCalendarEvent className="w-4 h-4 mr-1 text-[#8395F9]" />
            {full}
          </span>
          <span className="flex items-center text-sm text-[#8ca1a6]">
            <IconMapPin className="w-4 h-4 mr-1 text-[#8395F9]" />
            {event.location}
          </span>
          <span className="flex items-center text-xs text-[#23223a]">
            {isOnline ? (
              <IconVideo className="w-4 h-4 mr-1 text-blue-600" />
            ) : (
              <IconMap2 className="w-4 h-4 mr-1 text-green-600" />
            )}
            {typeLabel}
          </span>
          <span className="flex items-center text-xs text-[#23223a]">
            <IconUsers className="w-4 h-4 mr-1" />
            {seatsLabel} seats
          </span>
          <span className="flex items-center text-xs text-[#23223a]">
            <IconTag className="w-4 h-4 mr-1 text-purple-600" />
            {formatCategoryName(event.category)}
          </span>
        </div>
        {/* Free badge */}
        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          Free
        </span>
        <div className="flex gap-2 mt-4">
          <Link href={`/events/${event.id}`}>
            <button className="px-4 py-2 bg-[#bfc3f7] text-[#201e36] rounded font-semibold hover:bg-[#aab3e6] transition">
              View
            </button>
          </Link>
          {userRole === "attendee" && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
              disabled={!!user && registrations[event.id]}
              onClick={() => handleAttend(event)}
            >
              {!user
                ? "Login to Attend"
                : registrations[event.id]
                ? "Registered"
                : "Attend"}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
