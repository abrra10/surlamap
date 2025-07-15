import React from "react";
import { Card, CardContent } from "../../components/ui/card";

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

const EventCard: React.FC<Props> = ({
  event,
  userRole,
  user,
  registrations,
  handleAttend,
}) => {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-40 object-cover rounded mb-3"
          />
        )}
        <h2 className="text-lg font-semibold">{event.name}</h2>
        <p className="text-gray-600">{new Date(event.date).toLocaleString()}</p>
        <p className="text-gray-500">{event.location}</p>
        <p className="text-sm mt-2">
          <span className="font-medium">Category:</span> {event.category}
        </p>
        <p className="text-sm">
          <span className="font-medium">Price:</span> ${event.price.toFixed(2)}
        </p>
        {userRole === "attendee" && (
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
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
      </CardContent>
    </Card>
  );
};

export default EventCard;
