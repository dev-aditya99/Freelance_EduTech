"use client";

import React from "react";
// Import your dynamic Loader component
import { Loader, LoaderVariant } from "./Loader";

// Button ke saare possible variations define kiye hain
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  loaderVariant?: LoaderVariant; // Optional: Override loader animation
}

export const DynamicButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      isFullWidth = false,
      loaderVariant = "spinner", // Default loader inside button
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 border border-transparent",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-transparent",
      outline:
        "bg-transparent text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50",
      ghost:
        "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 border border-transparent",
    };

    // 📏 Sizes Mapping
    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-4 py-2.5 text-sm rounded-xl",
      lg: "px-6 py-3 text-base rounded-xl",
      icon: "p-2.5 flex items-center justify-center rounded-xl", // Sirf icon ke liye perfect square
    };

    // 🔄 Base Styles (Har button me apply honge)
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.98] whitespace-nowrap";

    // 🚫 Disabled / Loading State
    const disabledStyles =
      disabled || isLoading
        ? "opacity-60 cursor-not-allowed pointer-events-none"
        : "";

    // ↔️ Full Width State
    const widthStyles = isFullWidth ? "w-full" : "";

    // Final ClassName Combine
    const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`;

    // 🎨 Auto-detect Loader Color based on Button Variant
    const getLoaderColor = () => {
      if (variant === "primary" || variant === "danger") return "white";
      if (
        variant === "secondary" ||
        variant === "outline" ||
        variant === "ghost"
      )
        return "slate";
      return "primary";
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {/* 🔄 Our Custom Dynamic Loader */}
        {isLoading && (
          <Loader
            variant={loaderVariant}
            size="sm" // 'sm' map karta hai 'w-4 h-4' ko jo button me fit baithta hai
            color={getLoaderColor()}
            className="shrink-0 !gap-0" // override any inner gaps
          />
        )}

        {/* Left Icon (Hide if loading to maintain layout) */}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}

        {/* Button Content / Text (Hide if it's strictly an icon button with no children) */}
        {children && <span>{children}</span>}

        {/* Right Icon */}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

DynamicButton.displayName = "Button";
