import React from "react";
import Image from "next/image";
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
          <div className="relative w-full h-48">
            <Image
              src={event.image_url}
              alt={event.name}
              fill
              className="object-cover"
            />
          </div>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#201e36]">
              {event.price === 0 ? "Free" : `$${event.price}`}
            </span>
            {event.seats && (
              <span className="text-sm text-gray-500">
                • {event.seats} seats
              </span>
            )}
          </div>
        </div>

        {/* View Details Button */}
        <Link
          href={`/events/${event.id}`}
          className="block w-full bg-[#bfc3f7] text-[#201e36] text-center py-2 px-4 rounded-md font-medium hover:bg-[#a8adf0] transition-colors duration-200"
        >
          View Details
        </Link>
      </CardContent>
    </Card>
  );
};

export default EventCard;
