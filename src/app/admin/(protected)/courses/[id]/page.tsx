"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Globe, Clock, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { CourseOverview } from "@/components/admin/course-details/CourseOverview";
import { CourseCurriculum } from "@/components/admin/course-details/CourseCurriculum";
import { CourseStudents } from "@/components/admin/course-details/CourseStudents";
import { Loader } from "@/components/ui/Loader";
import { useSearchParams } from "next/navigation";

export default function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const localData = localStorage.getItem("current_course");
    if (localData) {
      setCourse(JSON.parse(localData));
    }
    setIsMounted(true);
  }, []);

  if (!isMounted) return <Loader fullScreen size="lg" />;
  if (!course)
    return (
      <div className="p-10 text-center text-slate-500">
        Course data not found in local storage.
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 sm:text-sm text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Courses</span>
          <span className="inline sm:hidden">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="sm:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Globe size={18} />
          </button>
          <Link
            href={`/admin/courses/${course._id}/edit`}
            className="flex items-center gap-2 sm:px-4 sm:py-2 sm:bg-white dark:bg-[#111] sm:border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium sm:text-sm text-xs sm:shadow-sm hover:bg-slate-50 text-nowrap"
          >
            <Edit size={16} /> Edit Details
          </Link>
        </div>
      </div>

      {/* Top Banner Profile */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="md:h-48 sm:h-68 h-88 w-full relative">
          <Image
            src={course.thumbnail || "https://placehold.co/700x192"}
            alt={course.title}
            unoptimized={course.thumbnail ? false : true}
            fill
            className="object-cover"
            quality={100}
            priority
            placeholder="blur"
            blurDataURL="https://placehold.co/700x192"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 md:left-8 right-6 md:right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-white">
              <div className="flex gap-2 mb-3">
                <span className="bg-blue-600 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  {course.status}
                </span>
                {course.isFeatured && (
                  <span className="bg-amber-500 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider text-amber-950">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {course.title}
              </h1>
              <p className="text-slate-300 mt-2 max-w-2xl text-sm line-clamp-1">
                {course.shortDescription}
              </p>
            </div>
            <div className="w-fit bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-6 shrink-0">
              <div>
                <p className="text-white/60 text-xs font-semibold mb-1">
                  Price
                </p>
                <p className="text-white font-bold text-xl flex md:items-start items-center md:flex-col flex-row md:gap-0 gap-2">
                  {course.isFree ? (
                    <span>Free</span>
                  ) : (
                    <>
                      {course.discountPrice && (
                        <span className="line-through font-normal text-sm text-gray-200">
                          ₹{course.price}
                        </span>
                      )}
                      <span>₹{course.discountPrice || course.price}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-white/60 text-xs font-semibold mb-1">
                  Enrollments
                </p>
                <p className="text-white font-bold text-xl text-center">
                  {course.enrollmentCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - 🟢 Removed SEO & Settings 🟢 */}
        <div className="flex overflow-x-auto custom-scrollbar px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0A0A]">
          {["overview", "curriculum", "students"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`sm:px-5 px-3 py-4 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && <CourseOverview course={course} />}
              {activeTab === "curriculum" && (
                <CourseCurriculum course={course} />
              )}
              {activeTab === "students" && <CourseStudents course={course} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Info (Right Column) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Course Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Level</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {course.level?.toLowerCase() || "Beginner"}
                </span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Language</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {course.course_language?.toLowerCase() || "English"}
                </span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Ratings</span>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {course.averageRating || 0}({course.totalRatings || 0})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
