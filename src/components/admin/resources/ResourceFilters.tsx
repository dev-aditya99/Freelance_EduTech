"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { DynamicSelect } from "@/components/ui/DynamicSelect";
import { DynamicSearchSelect } from "@/components/ui/DynamicSearchSelect";
import { getCourses } from "@/services/course.service";

interface ResourceFiltersProps {
  currentFilters: any;
  onFilterChange: (filters: any) => void;
}

export function ResourceFilters({
  currentFilters,
  onFilterChange,
}: ResourceFiltersProps) {
  const [localSearch, setLocalSearch] = useState(currentFilters.search);

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
    onFilterChange({ search: "", courseId: "", sectionId: "", type: "" });
  };

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.courseId ||
    currentFilters.sectionId ||
    currentFilters.type;

  return (
    <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search resources by file name..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-inter focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        {/* Resource Type Filter */}
        <div className="w-full sm:w-40 shrink-0 z-[60]">
          <DynamicSelect
            value={currentFilters.type}
            onChange={(val) =>
              onFilterChange({ ...currentFilters, type: val as string })
            }
            placeholder="All File Types"
            options={[
              { value: "", label: "All Types" },
              { value: "PDF", label: "PDF Document" },
              { value: "ZIP", label: "ZIP Archive" },
              { value: "CODE", label: "Source Code" },
              { value: "IMAGE", label: "Image" },
              { value: "OTHER", label: "Other" },
            ]}
          />
        </div>

        {/* Course Filter */}
        <div className="w-full sm:w-56 shrink-0 z-50">
          <DynamicSearchSelect
            value={currentFilters.courseId}
            onChange={(val) =>
              onFilterChange({ ...currentFilters, courseId: val as string })
            }
            placeholder="Search Course..."
            fetchFn={async (query) => {
              try {
                const res = await getCourses({ search: query, limit: 10 });
                return res?.data || res?.courses || [];
              } catch (error) {
                return [];
              }
            }}
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
