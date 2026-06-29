"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  UserCheck,
  ClipboardList,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

// --- MOCK DATA ---
const statsData = [
  {
    title: "Total Students",
    value: "24,592",
    change: "+12.5%",
    isPositive: true,
    icon: Users,
  },
  {
    title: "Total Courses",
    value: "148",
    change: "+4.2%",
    isPositive: true,
    icon: BookOpen,
  },
  {
    title: "Total Instructors",
    value: "64",
    change: "+2.1%",
    isPositive: true,
    icon: UserCheck,
  },
  {
    title: "Total Enrollments",
    value: "86,432",
    change: "+18.2%",
    isPositive: true,
    icon: ClipboardList,
  },
  {
    title: "Certificates Issued",
    value: "12,845",
    change: "+24.8%",
    isPositive: true,
    icon: Award,
  },
];

const growthData = [
  { name: "Jan", students: 4000, enrollments: 6400, certificates: 1200 },
  { name: "Feb", students: 5000, enrollments: 7800, certificates: 1800 },
  { name: "Mar", students: 6800, enrollments: 9200, certificates: 2400 },
  { name: "Apr", students: 8200, enrollments: 11400, certificates: 3200 },
  { name: "May", students: 10500, enrollments: 15600, certificates: 4800 },
  { name: "Jun", students: 14200, enrollments: 21000, certificates: 6400 },
];

const recentEnrollments = [
  {
    id: 1,
    student: "Alex Rivera",
    course: "Advanced React Patterns",
    date: "2 mins ago",
    amount: "$149",
  },
  {
    id: 2,
    student: "Sarah Chen",
    course: "UI/UX Masterclass",
    date: "15 mins ago",
    amount: "$199",
  },
  {
    id: 3,
    student: "Michael Doe",
    course: "Python for Data Science",
    date: "1 hour ago",
    amount: "$89",
  },
  {
    id: 4,
    student: "Emily Smith",
    course: "System Design Prep",
    date: "3 hours ago",
    amount: "$249",
  },
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// --- CUSTOM TOOLTIP FOR RECHARTS ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl dark:shadow-none">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 dark:text-slate-400 capitalize">
              {entry.name}:
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
    >
      {/* HEADER SECTION */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and manage your platform's performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm">
            <Calendar size={16} />
            <span>Last 6 Months</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* TOP STATS CARDS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {statsData.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none flex flex-col justify-between group hover:border-blue-500/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <stat.icon size={18} strokeWidth={2.5} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.isPositive ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"}`}
              >
                {stat.isPositive ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Growth Area Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Student Growth
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total active students over time
              </p>
            </div>
            <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={growthData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorStudents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#475569",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Enrollment Bar Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Enrollment Volume
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monthly course purchases
            </p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={growthData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#334155", opacity: 0.1 }}
                />
                <Bar
                  dataKey="enrollments"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM SECTION: LISTS & TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Line Chart (Takes 1 Col) */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Certificates Issued
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Completion milestones
            </p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={growthData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="certificates"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#10B981",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Enrollments Table (Takes 2 Cols) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Recent Enrollments
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Latest platform transactions
              </p>
            </div>
            <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentEnrollments.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-xs">
                          {item.student.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {item.student}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {item.course}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                        {item.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
