"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Tags,
  UsersRound,
  BookOpen,
  ListTree,
  PlaySquare,
  FileBox,
  GraduationCap,
  ClipboardList,
  Award,
  BarChart3,
  Settings,
  LogOut,
  X,
  Box,
} from "lucide-react";
import LogoutButton from "../common/logout-button";

const MENU_ITEMS = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
      { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    ],
  },
  {
    group: "Catalog",
    items: [
      { name: "Categories", icon: Tags, href: "/admin/categories" },
      { name: "Courses", icon: BookOpen, href: "/admin/courses" },
      { name: "Videos", icon: ListTree, href: "/admin/videos" },
      { name: "Resources", icon: FileBox, href: "/admin/resources" },
    ],
  },
  {
    group: "Users & Engagement",
    items: [
      { name: "Instructors", icon: UsersRound, href: "/admin/instructors" },
      { name: "Students", icon: GraduationCap, href: "/admin/students" },
      { name: "Enrollments", icon: ClipboardList, href: "/admin/enrollments" },
      { name: "Certificates", icon: Award, href: "/admin/certificates" },
    ],
  },
];

export function Sidebar({ isCollapsed, isMobileOpen, setMobileOpen }: any) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? (!isMobileOpen ? 80 : 200) : 280,
          x: isMobileOpen
            ? 0
            : typeof window !== "undefined" &&
                window.innerWidth < 1024 &&
                !isMobileOpen
              ? -280
              : 0,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`fixed lg:relative z-50 h-full bg-white dark:bg-[#111111] border-r border-slate-200 dark:border-slate-800 flex flex-col ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-inner">
              <Box size={18} className="text-white" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-slate-900 dark:text-white text-lg tracking-tight whitespace-nowrap"
                >
                  EduSaaS
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
          {MENU_ITEMS.map((group, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {group.group}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.name}>
                      <Link href={item.href}>
                        <div
                          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group ${isActive ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"}`}
                        >
                          <item.icon
                            size={20}
                            className={`shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}
                            strokeWidth={isActive ? 2.5 : 2}
                          />

                          {!isCollapsed && (
                            <span className="text-sm font-medium whitespace-nowrap">
                              {item.name}
                            </span>
                          )}

                          {/* Active Indicator line */}
                          {isActive && !isCollapsed && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                            />
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link href="/admin/settings">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 ${isCollapsed ? "justify-center" : ""}`}
            >
              <Settings size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Settings</span>
              )}
            </div>
          </Link>

          {!isCollapsed && (
            // <span className="text-sm font-medium">Logout</span>
            <LogoutButton
              type="admin"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 ${isCollapsed ? "justify-center" : ""}`}
            />
          )}
        </div>
      </motion.aside>
    </>
  );
}
