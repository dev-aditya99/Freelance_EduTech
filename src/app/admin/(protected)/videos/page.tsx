"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HardDrive, PlaySquare } from "lucide-react";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { getAllVideos } from "@/services/video.service";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { VideoFilters } from "@/components/admin/videos/VideoFilters";
import { VideoCard } from "@/components/admin/videos/VideoCard";

export default function VideoLibraryPage() {
  const { execute, isLoading } = useAsyncHandler();

  const [videos, setVideos] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  // Active Filters State
  const [filters, setFilters] = useState({
    search: "",
    courseId: "",
    sectionId: "",
    status: "",
  });

  // Data Fetching Logic
  const fetchVideos = useCallback(
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
          if (filters.status) params.append("status", filters.status);

          // 🟢 Using your service correctly here (data is directly returned)
          const responseData = await getAllVideos(params.toString());

          setVideos(responseData.data || responseData.lessons || []);
          if (responseData.pagination) {
            setPagination(responseData.pagination);
          }
          return responseData;
        },
        { showToast: false, loadingKey: "fetch_videos" },
      );
    },
    [filters, execute],
  );

  // Initial Fetch & Filter Changes
  useEffect(() => {
    fetchVideos(1);
  }, [fetchVideos]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sora text-slate-900 dark:text-white tracking-tight">
            Video Library
          </h1>
          <p className="text-sm text-slate-500 font-inter mt-1 flex items-center gap-2">
            <HardDrive size={14} /> Total {pagination.total || videos.length}{" "}
            videos hosted
          </p>
        </div>
      </div>

      {/* Filters Component */}
      <VideoFilters
        currentFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Content Area */}
      {isLoading("fetch_videos") && videos.length === 0 ? (
        <div className="py-20">
          <Loader fullContainer size="lg" text="Loading video library..." />
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={PlaySquare}
          title="No videos found"
          description="Try adjusting your filters or upload a new video to your lessons."
          variant="page"
        />
      ) : (
        <div className="space-y-8">
          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onRefresh={() => fetchVideos(pagination.page)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 font-medium font-inter">
                Showing Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DynamicButton
                  variant="outline"
                  isFullWidth
                  disabled={pagination.page === 1 || isLoading("fetch_videos")}
                  onClick={() => fetchVideos(pagination.page - 1)}
                  className="sm:w-auto"
                >
                  Previous
                </DynamicButton>
                <DynamicButton
                  variant="outline"
                  isFullWidth
                  disabled={
                    pagination.page === pagination.totalPages ||
                    isLoading("fetch_videos")
                  }
                  onClick={() => fetchVideos(pagination.page + 1)}
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
