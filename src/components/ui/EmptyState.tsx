"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { useRouter } from "next/navigation";

export type EmptyStateVariant = "page" | "card" | "inline";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  image?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: EmptyStateVariant;
  className?: string;
  routePath?: string | null;
  routeLabel?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  image,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = "page",
  className = "",
  routePath = null,
  routeLabel = "Redirect",
}: EmptyStateProps) {
  // Hooks
  const router = useRouter();

  const variantStyles = {
    page: "min-h-[60vh] flex-col justify-center",
    card: "min-h-[300px] sm:min-h-[400px] flex-col justify-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-[#111]",
    inline: "py-12 flex-col justify-center",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center text-center p-6 w-full ${variantStyles[variant]} ${className}`}
    >
      <div className="flex flex-col items-center max-w-md mx-auto">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain mb-6 drop-shadow-sm"
          />
        ) : Icon ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-5 shadow-sm">
            <Icon size={32} className="sm:w-10 sm:h-10" strokeWidth={1.5} />
          </div>
        ) : null}

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {description}
          </p>
        )}

        {(onAction || onSecondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            {onAction && actionLabel && (
              <DynamicButton
                variant="primary"
                onClick={onAction}
                isFullWidth
                className="sm:w-auto"
              >
                {actionLabel}
              </DynamicButton>
            )}
            {onSecondaryAction && secondaryActionLabel && (
              <DynamicButton
                variant="outline"
                onClick={onSecondaryAction}
                isFullWidth
                className="sm:w-auto"
              >
                {secondaryActionLabel}
              </DynamicButton>
            )}
          </div>
        )}

        {routePath && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <DynamicButton
              variant="primary"
              onClick={() => router.push(routePath)}
              isFullWidth
              className="sm:w-auto"
            >
              {routeLabel}
            </DynamicButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}
