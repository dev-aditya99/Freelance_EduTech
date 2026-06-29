"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  SunMoon,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export function Header({ toggleSidebar, toggleMobileMenu, isCollapsed }: any) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const paths = pathname.split("/").filter(Boolean);

  return (
    <header className="w-full min-h-16 bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 transition-all duration-300 min-w-0">
      {/* Left Section: Toggles & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 -ml-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="min-w-0 max-w-100 hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400 capitalize font-medium overflow-x-auto custom-scrollbar">
          {paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            const href = `/${paths.slice(0, index + 1).join("/")}`;

            return (
              <div key={path} className="flex items-center justify-start">
                <Link
                  href={href}
                  className={`hover:text-slate-900 dark:hover:text-white transition-colors ${isLast ? "text-slate-900 dark:text-slate-200 font-semibold" : ""}`}
                >
                  {path}
                </Link>
                {!isLast && (
                  <ChevronRight
                    size={14}
                    className="text-slate-400 dark:text-slate-600"
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right Section: Search & Actions */}
      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 md:gap-2 lg:gap-4">
        {/* Global Search Bar (CMD+K style) */}
        <div className="hidden md:flex items-center relative group">
          <Search
            size={16}
            className="absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Search anything..."
            className="md:w-[180px] lg:w-[220px] pl-9 pr-12 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
            ⌘K
          </kbd>
        </div>

        {/* Theme Toggle (Placeholder) */}
        <button className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <SunMoon size={20} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-[#0A0A0A]"></span>
        </button>

        {/* User Profile Dropdown Trigger */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-sm">
          <img
            src="https://i.pravatar.cc/150?u=admin"
            alt="Admin"
            className="h-full w-full rounded-full border-2 border-white dark:border-[#0A0A0A] object-cover bg-white"
          />
        </div>
      </div>
    </header>
  );
}
