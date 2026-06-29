"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { CourseFilters } from "@/components/admin/courses/CourseFilters";
import { CourseTable } from "@/components/admin/courses/CourseTable";
import { CourseMobileCards } from "@/components/admin/courses/CourseMobileCards";
import { useEffect, useState } from "react";
import { useCourseStore } from "@/store/course.store";

export enum ICourseView {
  TABLE = "TABLE",
  CARD = "CARD",
}

export default function CoursesPage() {
  const { fetchCourses, searchQuery, statusFilter } = useCourseStore();
  const [view, setView] = useState<ICourseView>(
    localStorage.getItem("course_view"),
  );

  useEffect(() => {
    const holdView = localStorage.getItem("course_view") || ICourseView.TABLE;

    console.log(holdView);
    setView(holdView as ICourseView);
  }, []);

  useEffect(() => {
    fetchCourses({
      page: 1,
      search: searchQuery,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Course Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and organize your premium educational content.
          </p>
        </div>
        <Link
          href={"/admin/courses/create"}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} />
          <span>Add New Course</span>
        </Link>
      </div>

      <div className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
        <CourseFilters />
        {view == ICourseView.TABLE ? (
          <CourseTable />
        ) : (
          <div className="w-full flex items-start justify-start">
            <CourseMobileCards />
          </div>
        )}
      </div>
    </div>
  );
}
