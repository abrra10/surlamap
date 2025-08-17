import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { IconMapPin, IconVideo, IconMap2 } from "@tabler/icons-react";
import Link from "next/link";

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
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const EventCard: React.FC<Props> = ({ event }) => {
  // Determine if it's online or in-person
  const isOnline =
    event.location.toLowerCase().includes("online") ||
    event.location.toLowerCase().includes("zoom");
  const typeLabel = isOnline ? "Online" : "In Person";

  // Format date for the corner label
  const dateLabel = formatDate(event.date);

  return (
    <Card className="bg-white border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 p-0">
      <div className="relative">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <div className="text-white text-2xl font-bold opacity-50">
              {event.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Date label overlay in top-left corner */}
        <div className="absolute top-3 left-3 bg-[#bfc3f7] bg-opacity-75 text-[#201e36] rounded px-3 py-1 text-sm font-medium">
          {dateLabel}
        </div>

        {/* Online/In-person indicator */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded px-2 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
          {isOnline ? (
            <IconVideo className="w-3 h-3 text-blue-600" />
          ) : (
            <IconMap2 className="w-3 h-3 text-green-600" />
          )}
          {typeLabel}
        </div>
      </div>

      <CardContent className="p-4">
        {/* Event title */}
        <h2 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2 leading-tight">
          {event.name}
        </h2>

        {/* Location (only show for in-person events) */}
        {!isOnline && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <IconMapPin className="w-4 h-4 mr-1 text-gray-500" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Price indicator */}
        <div className="mb-4">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
            {event.price === 0 ? "Free" : `${event.price} DZD`}
          </span>
        </div>

        {/* Action button */}
        <div className="flex gap-2">
          <Link href={`/events/${event.id}`} className="w-full">
            <button className="w-full px-4 py-2 bg-[#bfc3f7] text-[#201e36] rounded-lg font-semibold hover:bg-[#aab3e6] transition-colors duration-200">
              View Details
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
