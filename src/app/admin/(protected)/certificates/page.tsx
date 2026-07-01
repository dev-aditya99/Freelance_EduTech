"use client";

import React, { useEffect } from "react";
import { Award, LayoutTemplate, Search, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCertificateStore } from "@/store/certificate.store";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { DynamicDate } from "@/components/ui/DynamicDate";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";

export default function CertificatesPage() {
  const router = useRouter();
  const {
    certificates,
    fetchCertificates,
    isLoading,
    searchQuery,
    setSearchQuery,
    pagination,
    setPage,
  } = useCertificateStore();

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sora text-slate-900 dark:text-white tracking-tight">
            Issued Certificates
          </h1>
          <p className="text-sm text-slate-500 font-inter mt-1 flex items-center gap-2">
            <Award size={14} /> Track all certificates issued to students
          </p>
        </div>
        <DynamicButton
          variant="primary"
          leftIcon={<LayoutTemplate size={16} />}
          onClick={() => router.push("/admin/certificates/templates")}
        >
          Manage Templates
        </DynamicButton>
      </div>

      {/* Filters & Search */}
      <div className="p-5 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center">
        <div className="relative w-full md:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by student name or cert ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading && certificates.length === 0 ? (
          <div className="py-20">
            <Loader fullContainer text="Loading certificates..." />
          </div>
        ) : certificates.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Certificate ID</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Issued On</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {certificates.map((cert) => (
                  <tr
                    key={cert._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {cert.certificateNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {cert.studentName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {cert.user?.email}
                      </p>
                    </td>
                    <td
                      className="px-6 py-4 text-slate-700 dark:text-slate-300 truncate max-w-xs"
                      title={cert.course?.title}
                    >
                      {cert.course?.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <DynamicDate date={cert.createdAt} formatType="hybrid" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* You can add a preview logic here by fetching signed URL */}
                      <button className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Award}
            title="No Certificates Issued"
            description="Students haven't completed courses to generate certificates yet."
            variant="card"
          />
        )}

        {/* Pagination logic here (same as courses) */}
      </div>
    </div>
  );
}
