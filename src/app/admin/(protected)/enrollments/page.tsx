"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import { useEnrollmentStore } from "@/store/enrollment.store";
import { Loader } from "@/components/ui/Loader";
import { EnrollmentFilters } from "@/components/admin/enrollments/EnrollmentFilters";
import { EnrollmentTable } from "@/components/admin/enrollments/EnrollmentTable";

export default function EnrollmentsManagementPage() {
  const { isLoading, enrollments } = useEnrollmentStore();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sora text-slate-900 dark:text-white tracking-tight">
            Enrollments & Access
          </h1>
          <p className="text-sm text-slate-500 font-inter mt-1 flex items-center gap-2">
            <GraduationCap size={14} /> Manage student access, progress, and
            expirations
          </p>
        </div>
      </div>

      <div className="space-y-0">
        <EnrollmentFilters />

        {isLoading && enrollments.length === 0 ? (
          <div className="py-20 bg-white dark:bg-[#111] border-x border-b border-slate-200 dark:border-slate-800 rounded-b-2xl">
            <Loader fullContainer size="lg" text="Loading enrollments..." />
          </div>
        ) : (
          <EnrollmentTable />
        )}
      </div>
    </div>
  );
}
