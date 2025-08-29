import React, { useCallback, useRef } from "react";
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
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedSetSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setSearch(value);
      }, 300); // 300ms delay
    },
    [setSearch]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full flex justify-center mb-8 relative">
      <div className="flex w-full max-w-4xl bg-white rounded-full shadow-lg px-2 py-2 md:py-3 gap-2 md:gap-4 items-center ">
        <Input
          placeholder="Search by name, location, or category..."
          value={search}
          onChange={(e) => debouncedSetSearch(e.target.value)}
          className="flex-1 max-w-[600px] bg-transparent border-none focus:ring-0 focus-visible:ring-0 shadow-none px-4 text-base placeholder-[#aab3e6] min-w-0 font-body"
        />
      </div>

      {/* Search Results Dropdown */}
      {resultsOpen && search.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 max-w-4xl mx-auto mt-2 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {resultsLoading ? (
            <div className="p-4 text-center text-[#201e36] font-montserrat">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.slice(0, 8).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block px-4 py-3 hover:bg-[#f2fae6] transition-colors "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-fugaz text-[#201e36] font-semibold">
                        {event.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-[#201e36] text-opacity-70 mt-1 font-body">
                        <span>{formatDate(event.date)}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            search.trim() && (
              <div className="p-4 text-center text-[#201e36] font-montserrat">
                No events found matching &quot;{search}&quot;
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default EventFilters;
