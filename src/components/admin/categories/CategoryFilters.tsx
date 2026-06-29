import React from "react";
import {
  Search,
  Filter,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";

interface FilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortOption: string;
  setSortOption: (val: string) => void;
}

export function CategoryFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
}: FilterProps) {
  return (
    <div className="max-w-full p-4 sm:p-5 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-center bg-slate-50/50 dark:bg-[#111] rounded-t-2xl">
      {/* Search Input */}
      <div className="relative w-full md:w-[320px] shrink-0">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-row flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative w-[140px] sm:flex-none">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white appearance-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="relative w-[140px] sm:flex-none">
          {sortOption === "asc" ? (
            <CalendarArrowDown
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          ) : (
            <CalendarArrowUp
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          )}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white appearance-none cursor-pointer"
          >
            {/* <option value="NEWEST">Newest First</option>
          <option value="OLDEST">Oldest First</option>
          <option value="A_Z">Name (A-Z)</option>
          <option value="Z_A">Name (Z-A)</option> */}
            <option value="asc">Earliest</option>

            <option value="desc">Newest</option>
          </select>
        </div>
      </div>
    </div>
  );
}
