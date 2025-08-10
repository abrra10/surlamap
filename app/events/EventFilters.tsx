import React from "react";
import { Input } from "../../components/ui/input";

type Props = {
  search: string;
  setSearch: (val: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
};

const EventFilters: React.FC<Props> = ({ search, setSearch }) => {
  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex w-full max-w-4xl bg-white rounded-full shadow-lg px-2 py-2 md:py-3 gap-2 md:gap-4 items-center">
        <Input
          placeholder="Search by name, location, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-[600px] bg-transparent border-none focus:ring-0 focus-visible:ring-0 shadow-none px-4 text-base placeholder-gray-400 min-w-0"
        />
      </div>
    </div>
  );
};

export default EventFilters;
