"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderArchive, FileText } from "lucide-react";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { adminApi } from "@/lib/admin-api";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { ResourceFilters } from "@/components/admin/resources/ResourceFilters";
import { ResourceCard } from "@/components/admin/resources/ResourceCard";

export default function ResourceLibraryPage() {
  const { execute, isLoading } = useAsyncHandler();

  const [resources, setResources] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    courseId: "",
    sectionId: "",
    type: "",
  });

  const fetchResources = useCallback(
    async (pageToFetch = 1) => {
      await execute(
        async () => {
          const params = new URLSearchParams({
            page: pageToFetch.toString(),
            limit: "12",
          });

          if (filters.search) params.append("search", filters.search);
          if (filters.courseId) params.append("courseId", filters.courseId);
          if (filters.sectionId) params.append("sectionId", filters.sectionId);
          if (filters.type) params.append("type", filters.type);

          const { data } = await adminApi.get(
            `/admin/lessons/all_resources?${params.toString()}`,
          );

          setResources(data.data || []);
          if (data.pagination) setPagination(data.pagination);

          return data;
        },
        { showToast: false, loadingKey: "fetch_resources" },
      );
    },
    [filters, execute],
  );

  useEffect(() => {
    fetchResources(1);
  }, [fetchResources]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sora text-slate-900 dark:text-white tracking-tight">
            Resource Library
          </h1>
          <p className="text-sm text-slate-500 font-inter mt-1 flex items-center gap-2">
            <FolderArchive size={14} /> Total{" "}
            {pagination.total || resources.length} files hosted
          </p>
        </div>
      </div>

      <ResourceFilters
        currentFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {isLoading("fetch_resources") && resources.length === 0 ? (
        <div className="py-20">
          <Loader fullContainer size="lg" text="Loading resources..." />
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resources found"
          description="Try adjusting your filters or upload a new PDF/Doc to your lessons."
          variant="page"
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onRefresh={() => fetchResources(pagination.page)}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 font-medium font-inter">
                Showing Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DynamicButton
                  variant="outline"
                  isFullWidth
                  disabled={
                    pagination.page === 1 || isLoading("fetch_resources")
                  }
                  onClick={() => fetchResources(pagination.page - 1)}
                  className="sm:w-auto"
                >
                  Previous
                </DynamicButton>
                <DynamicButton
                  variant="outline"
                  isFullWidth
                  disabled={
                    pagination.page === pagination.totalPages ||
                    isLoading("fetch_resources")
                  }
                  onClick={() => fetchResources(pagination.page + 1)}
                  className="sm:w-auto"
                >
                  Next
                </DynamicButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
