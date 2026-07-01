"use client";

import React, { useEffect } from "react";
import { Users } from "lucide-react";
import { useStudentStore } from "@/store/student.store";
import { Loader } from "@/components/ui/Loader";
import { StudentFilters } from "@/components/admin/students/StudentFilters";
import { StudentTable } from "@/components/admin/students/StudentTable";

export default function StudentsManagementPage() {
  const { fetchStudents, isLoading, students } = useStudentStore();

  useEffect(() => {
    // Initial fetch
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sora text-slate-900 dark:text-white tracking-tight">
            Student Management
          </h1>
          <p className="text-sm text-slate-500 font-inter mt-1 flex items-center gap-2">
            <Users size={14} /> Manage registered users, blocks, and identities
          </p>
        </div>
      </div>

      <div className="space-y-0">
        <StudentFilters />

        {isLoading && students.length === 0 ? (
          <div className="py-20 bg-white dark:bg-[#111] border-x border-b border-slate-200 dark:border-slate-800 rounded-b-2xl">
            <Loader
              fullContainer
              size="lg"
              text="Loading students directory..."
            />
          </div>
        ) : (
          <StudentTable />
        )}
      </div>
    </div>
  );
}
