"use client";

import React, { useState, useEffect } from "react";

export type DateFormatType = "local" | "relative" | "hybrid" | "hybrid-reverse";

export interface DynamicDateProps {
  date: string | Date | number;
  formatType?: DateFormatType;
  enableExpand?: boolean;
  className?: string;
  stopPropgation?: boolean;
}

export function DynamicDate({
  date,
  formatType = "local",
  enableExpand = false,
  className = "",
  stopPropgation = true,
}: DynamicDateProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration mismatch ko rokne ke liye useEffect
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!date) return null;

  const dateObj = new Date(date);

  // Helper 1: Local Date Format (e.g., 12 Oct 2023, 10:30 AM)
  const getLocalFormat = (detailed = false) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: detailed ? "numeric" : undefined, // Expand hone par seconds bhi dikhayega
      hour12: true,
    }).format(dateObj);
  };

  // Helper 2: Relative Time Format (e.g., 2 min ago, 1D ago)
  const getRelativeFormat = () => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}D ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}M ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}Y ago`;
  };

  const getDisplayText = () => {
    // Agar user ne click karke expand kiya hai toh hamesha full local time dikhao
    if (isExpanded) return getLocalFormat(true);

    const diffInHours =
      Math.abs(new Date().getTime() - dateObj.getTime()) / 36e5;

    switch (formatType) {
      case "local":
        return getLocalFormat();
      case "relative":
        return getRelativeFormat();
      case "hybrid":
        // Teri requirement: 24hrs tak local, uske baad relative (1D ago, 2D ago)
        if (diffInHours <= 24) return getLocalFormat();
        return getRelativeFormat();
      case "hybrid-reverse":
        // Standard SaaS approach: 24hrs tak relative (2 hrs ago), fir pakka date (12 Oct 2023)
        if (diffInHours <= 24) return getRelativeFormat();
        return getLocalFormat();
      default:
        return getLocalFormat();
    }
  };

  // Server-side rendering ke time pe blank return karega taaki UI break na ho
  if (!mounted) return <span className="opacity-0">Loading...</span>;

  return (
    <span
      onClick={(e) => {
        if (stopPropgation) {
          e.stopPropagation();
        }
        enableExpand && setIsExpanded(!isExpanded);
      }}
      title={getLocalFormat(true)} // Hover karne par hamesha full time dikhega
      className={`text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap ${
        enableExpand
          ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
          : ""
      } ${className}`}
    >
      {getDisplayText()}
    </span>
  );
}
