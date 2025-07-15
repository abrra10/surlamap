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
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
      {/* Search Bar */}
      <Input
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="md:w-64"
      />
      {/* Category Filter */}
      <Select
        value={selectedCategory || "all"}
        onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}
      >
        <SelectTrigger className="md:w-48">
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
      {/* Date Picker */}
      <div className="w-full md:w-auto">
        <DatePicker
          label=""
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Event date"
        />
      </div>
    </div>
  );
};

export default EventFilters;
