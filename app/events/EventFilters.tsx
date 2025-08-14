import React from "react";
import { Input } from "../../components/ui/input";
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
  registration_count?: number | { count: number };
};

type Props = {
  search: string;
  setSearch: (val: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  searchResults?: Event[];
  resultsOpen?: boolean;
  resultsLoading?: boolean;
};

const EventFilters: React.FC<Props> = ({
  search,
  setSearch,
  searchResults = [],
  resultsOpen = false,
  resultsLoading = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRegistrationCount = (event: Event) => {
    if (typeof event.registration_count === "number") {
      return event.registration_count;
    }
    return event.registration_count?.count || 0;
  };

  return (
    <div className="w-full flex justify-center mb-8 relative">
      <div className="flex w-full max-w-4xl bg-white rounded-full shadow-lg px-2 py-2 md:py-3 gap-2 md:gap-4 items-center">
        <Input
          placeholder="Search by name, location, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-[600px] bg-transparent border-none focus:ring-0 focus-visible:ring-0 shadow-none px-4 text-base placeholder-gray-400 min-w-0"
        />
      </div>

      {/* Search Results Dropdown */}
      {resultsOpen && (
        <div className="absolute top-full left-0 right-0 max-w-4xl mx-auto mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {resultsLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {event.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{formatDate(event.date)}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {event.category.replace("_", " ")}
                        </span>
                        <span>•</span>
                        <span>{getRegistrationCount(event)} registrations</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-purple-600">
                        ${event.price}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            search.trim() && (
              <div className="p-4 text-center text-gray-500">
                No events found matching "{search}"
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default EventFilters;
