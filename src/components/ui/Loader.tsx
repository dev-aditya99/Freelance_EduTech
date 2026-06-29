"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export type LoaderVariant = "spinner" | "dots" | "ring" | "pulse";
export type LoaderSize = "sm" | "md" | "lg" | "xl";
export type LoaderColor = "primary" | "white" | "slate" | "danger" | "emerald";

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  color?: LoaderColor;
  text?: string;
  fullScreen?: boolean;
  fullContainer?: boolean;
  className?: string;
}

export function Loader({
  variant = "spinner",
  size = "md",
  color = "primary",
  text,
  fullScreen = false,
  fullContainer = false,
  className = "",
}: LoaderProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const dotSizeMap = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
    xl: "w-5 h-5",
  };

  const colorMap = {
    primary: "text-blue-600",
    white: "text-white",
    slate: "text-slate-500",
    danger: "text-rose-600",
    emerald: "text-emerald-600",
  };

  const spinnerBorderMap = {
    primary: "border-slate-200 border-t-blue-600",
    white: "border-white/30 border-t-white",
    slate: "border-slate-200 border-t-slate-600",
    danger: "border-rose-200 border-t-rose-600",
    emerald: "border-emerald-200 border-t-emerald-600",
  };

  const selectedSize = sizeMap[size];
  const selectedColor = colorMap[color];

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <div
            className={`rounded-full animate-spin border-[3px] sm:border-4 ${spinnerBorderMap[color]} ${selectedSize}`}
          />
        );
      case "ring":
        return (
          <Loader2
            className={`animate-spin ${selectedColor} ${selectedSize}`}
          />
        );
      case "dots":
        return (
          <div
            className={`flex items-center justify-center gap-1.5 ${selectedColor}`}
          >
            <div
              className={`rounded-full bg-current animate-bounce ${dotSizeMap[size]}`}
              style={{ animationDelay: "0ms" }}
            />
            <div
              className={`rounded-full bg-current animate-bounce ${dotSizeMap[size]}`}
              style={{ animationDelay: "150ms" }}
            />
            <div
              className={`rounded-full bg-current animate-bounce ${dotSizeMap[size]}`}
              style={{ animationDelay: "300ms" }}
            />
          </div>
        );
      case "pulse":
        return (
          <div
            className={`rounded-full animate-ping opacity-75 bg-current ${selectedColor} ${selectedSize}`}
          />
        );
      default:
        return null;
    }
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {renderLoader()}
      {text && (
        <p
          className={`text-sm font-medium animate-pulse ${color === "white" ? "text-white/90" : "text-slate-500 dark:text-slate-400"}`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  if (fullContainer) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-[#111]/60 backdrop-blur-[2px] rounded-inherit">
        {content}
      </div>
    );
  }

  return content;
}
