import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, Users } from "lucide-react";

export function CourseStudents({ course }: { course: any }) {
  // Demo array for students
  const students: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-[#111] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Enrolled Students
          </h3>
          <p className="text-xs text-slate-500">View and manage learners.</p>
        </div>
        <div className="relative w-64 hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search student..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          variant="card"
          icon={Users}
          title="No students yet"
          description="Once users enroll in this course, they will appear here."
        />
      ) : (
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {/* Table logic will go here when data exists */}
        </div>
      )}
    </div>
  );
}
