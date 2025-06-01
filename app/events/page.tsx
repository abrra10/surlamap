"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  category: string;
  price: number;
  image_url: string | null;
};

const categories = [
  "conference",
  "workshop",
  "seminar",
  "networking",
  "social",
  "other",
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: true });

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Published Events</h1>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          className={`px-3 py-1 rounded ${
            !selectedCategory ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 rounded ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div>Loading events...</div>
      ) : events.length === 0 ? (
        <div>No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 bg-white shadow"
            >
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <h2 className="text-lg font-semibold">{event.name}</h2>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleString()}
              </p>
              <p className="text-gray-500">{event.location}</p>
              <p className="text-sm mt-2">
                <span className="font-medium">Category:</span> {event.category}
              </p>
              <p className="text-sm">
                <span className="font-medium">Price:</span> $
                {event.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
