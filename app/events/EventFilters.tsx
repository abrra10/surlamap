import React from "react";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { DatePicker } from "../../components/ui/date-picker";
import { Button } from "../../components/ui/button";

type Props = {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (val: string | null) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  categories: string[];
};

const EventFilters: React.FC<Props> = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedDate,
  setSelectedDate,
  categories,
}) => {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex justify-center mb-8"
      autoComplete="off"
    >
      <div className="flex w-full max-w-4xl bg-white rounded-full shadow-lg px-2 py-2 md:py-3 gap-2 md:gap-4 items-center">
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-[350px] md:max-w-[400px] bg-transparent border-none focus:ring-0 focus-visible:ring-0 shadow-none px-4 text-base placeholder-gray-400 min-w-0"
        />
        <div className="w-24 md:w-32 ml-2 md:ml-4">
          <DatePicker
            label=""
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Date"
          />
        </div>
        <div className="ml-2 md:ml-4 w-38 md:w-42">
          <Select
            value={selectedCategory || "all"}
            onValueChange={(val) =>
              setSelectedCategory(val === "all" ? null : val)
            }
          >
            <SelectTrigger className="w-full min-w-[140px] md:min-w-[180px] max-w-full bg-transparent border-none focus:ring-0 focus-visible:ring-0 shadow-none text-base px-3 py-2 pr-7">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          className="ml-2 rounded-full px-6 py-2 bg-[#A0F6B7] text-[#201e36] font-bold text-base shadow hover:bg-[#7be6a0] transition"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default EventFilters;
