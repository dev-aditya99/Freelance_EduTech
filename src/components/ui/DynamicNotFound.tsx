"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { DynamicButton } from "@/components/ui/DynamicButton";

export interface DynamicNotFoundProps {
  code?: string | number;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  showBackButton?: boolean;
  variant?: "page" | "component";
  className?: string;
}

export function DynamicNotFound({
  code = "404",
  title = "Page Not Found",
  description = "The page or resource you are looking for doesn't exist or has been moved.",
  actionLabel = "Go to Dashboard",
  actionHref,
  onAction,
  showBackButton = true,
  variant = "page",
  className = "",
}: DynamicNotFoundProps) {
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (onAction) {
      onAction();
    } else if (actionHref) {
      router.push(actionHref);
    } else {
      router.push("/admin"); // Default fallback
    }
  };

  const containerStyles =
    variant === "page"
      ? "min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0A] p-6"
      : "min-h-[400px] flex items-center justify-center bg-slate-50/50 dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-slate-800 p-6";

  return (
    <div className={`${containerStyles} w-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center max-w-md mx-auto"
      >
        {/* Error Code / Icon Visual */}
        <div className="relative mb-6">
          <h1 className="text-8xl md:text-9xl font-sora font-black text-slate-200 dark:text-slate-800/50 select-none">
            {code}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white dark:bg-[#1A1A1A] shadow-lg border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 rotate-12">
              <FileQuestion
                size={40}
                strokeWidth={1.5}
                className="-rotate-12"
              />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-sora tracking-tight">
          {title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm md:text-base">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {showBackButton && (
            <DynamicButton
              variant="outline"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => router.back()}
              isFullWidth
              className="sm:w-auto"
            >
              Go Back
            </DynamicButton>
          )}

          <DynamicButton
            variant="primary"
            leftIcon={<Home size={16} />}
            onClick={handlePrimaryAction}
            isFullWidth
            className="sm:w-auto"
          >
            {actionLabel}
          </DynamicButton>
        </div>
      </motion.div>
    </div>
  );
}
