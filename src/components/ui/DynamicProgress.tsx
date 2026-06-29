"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  X,
  CheckCircle2,
  AlertCircle,
  File,
  Image as ImageIcon,
  Video,
} from "lucide-react";

export type ProgressVariant = "bar" | "circle";
export type ProgressStatus = "uploading" | "success" | "error" | "paused";

export interface DynamicProgressProps {
  value: number;
  variant?: ProgressVariant;
  status?: ProgressStatus;
  title?: string;
  subtitle?: string;
  fileType?: "image" | "video" | "file" | "none";
  showPercentage?: boolean;
  onCancel?: () => void;
  className?: string;
  circleSize?: number; // Only for circle variant
}

export function DynamicProgress({
  value,
  variant = "bar",
  status = "uploading",
  title,
  subtitle,
  fileType = "none",
  showPercentage = true,
  onCancel,
  className = "",
  circleSize = 64,
}: DynamicProgressProps) {
  // Safely bound the value between 0 and 100
  const safeValue = Math.min(Math.max(value, 0), 100);

  // Auto-detect colors based on status
  const getColorClasses = () => {
    if (status === "success")
      return {
        bg: "bg-emerald-500",
        text: "text-emerald-500",
        stroke: "stroke-emerald-500",
        lightBg: "bg-emerald-50 dark:bg-emerald-500/10",
      };
    if (status === "error")
      return {
        bg: "bg-rose-500",
        text: "text-rose-500",
        stroke: "stroke-rose-500",
        lightBg: "bg-rose-50 dark:bg-rose-500/10",
      };
    if (status === "paused")
      return {
        bg: "bg-amber-500",
        text: "text-amber-500",
        stroke: "stroke-amber-500",
        lightBg: "bg-amber-50 dark:bg-amber-500/10",
      };
    return {
      bg: "bg-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      stroke: "stroke-blue-600 dark:stroke-blue-400",
      lightBg: "bg-blue-50 dark:bg-blue-500/10",
    };
  };

  const colors = getColorClasses();

  const getFileIcon = () => {
    if (fileType === "image")
      return <ImageIcon size={16} className="text-slate-500" />;
    if (fileType === "video")
      return <Video size={16} className="text-slate-500" />;
    if (fileType === "file")
      return <File size={16} className="text-slate-500" />;
    return null;
  };

  // ===================== BAR VARIANT =====================
  if (variant === "bar") {
    return (
      <div
        className={`w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111] shadow-sm ${className}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {fileType !== "none" && (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.lightBg}`}
              >
                {getFileIcon()}
              </div>
            )}
            <div className="truncate">
              {title && (
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {title}
                </p>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {status === "error" ? "Upload failed" : subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            {showPercentage && status === "uploading" && (
              <span className={`text-sm font-bold ${colors.text}`}>
                {Math.round(safeValue)}%
              </span>
            )}
            {status === "success" && (
              <CheckCircle2 size={20} className={colors.text} />
            )}
            {status === "error" && (
              <AlertCircle size={20} className={colors.text} />
            )}

            {status === "uploading" && onCancel && (
              <button
                onClick={onCancel}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Cancel Upload"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safeValue}%` }}
            transition={{ ease: "circOut", duration: 0.3 }}
            className={`h-full rounded-full ${colors.bg}`}
          />
        </div>
      </div>
    );
  }

  // ===================== CIRCLE VARIANT =====================
  const strokeWidth = circleSize * 0.08;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div
      className={`flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111] shadow-sm w-fit ${className}`}
    >
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: circleSize, height: circleSize }}
      >
        {/* Background Track Circle */}
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90 absolute inset-0"
        >
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            className={colors.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ ease: "circOut", duration: 0.3 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Inner Content (Icon or Percentage) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {status === "success" ? (
            <CheckCircle2 size={circleSize * 0.4} className={colors.text} />
          ) : status === "error" ? (
            <AlertCircle size={circleSize * 0.4} className={colors.text} />
          ) : showPercentage ? (
            <span
              className={`font-bold ${colors.text}`}
              style={{ fontSize: circleSize * 0.25 }}
            >
              {Math.round(safeValue)}%
            </span>
          ) : (
            getFileIcon()
          )}
        </div>
      </div>

      {/* Circle Variant Text & Actions */}
      {(title || subtitle || onCancel) && (
        <div className="flex items-center gap-4 pr-2">
          <div className="flex flex-col justify-center">
            {title && (
              <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                {title}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {status === "error" ? "Failed" : subtitle}
              </p>
            )}
          </div>
          {status === "uploading" && onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
