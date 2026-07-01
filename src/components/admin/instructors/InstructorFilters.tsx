"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { DynamicSelect } from "@/components/ui/DynamicSelect";

interface InstructorFiltersProps {
  currentFilters: { search: string; status: string };
  onFilterChange: (filters: { search: string; status: string }) => void;
}

export function InstructorFilters({
  currentFilters,
  onFilterChange,
}: InstructorFiltersProps) {
  const [localSearch, setLocalSearch] = useState(currentFilters.search);

  // Debounce logic for Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== currentFilters.search) {
        onFilterChange({ ...currentFilters, search: localSearch });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, currentFilters, onFilterChange]);

  const handleClear = () => {
    setLocalSearch("");
    onFilterChange({ search: "", status: "" });
  };

  const hasActiveFilters = currentFilters.search || currentFilters.status;

  return (
    <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search instructors by name..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-inter focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <div className="w-full sm:w-44 shrink-0">
          <DynamicSelect
            value={currentFilters.status}
            onChange={(val) =>
              onFilterChange({ ...currentFilters, status: val as string })
            }
            placeholder="All Status"
            options={[
              { value: "", label: "All Status" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="w-full sm:w-auto px-4 py-3 flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 font-semibold text-sm transition-colors"
          >
            <X size={16} className="sm:mr-0 mr-2" />{" "}
            <span className="sm:hidden">Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
