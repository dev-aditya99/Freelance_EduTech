"use client";

import React from "react";
import Image from "next/image";
import {
  Clock,
  MoreVertical,
  Trash2,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { adminApi } from "@/lib/admin-api";
import { DynamicDate } from "@/components/ui/DynamicDate";

export function VideoCard({
  video,
  onRefresh,
}: {
  video: any;
  onRefresh: () => void;
}) {
  const { execute } = useAsyncHandler();

  // Helper to format seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Helper to format bytes to MB
  const formatSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Status Badge Configuration
  const getStatusBadge = () => {
    switch (video.videoStatus) {
      case "READY":
        return (
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={12} /> Ready
          </div>
        );
      case "PROCESSING":
        return (
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            <Loader2 size={12} className="animate-spin" /> Processing
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle size={12} /> Failed
          </div>
        );
      case "UPLOADING":
        return (
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            <Loader2 size={12} className="animate-spin" /> Uploading
          </div>
        );
      default:
        return null;
    }
  };

  const handleDeleteVideo = async () => {
    await execute(
      async () => {
        await adminApi.delete(`/admin/lessons/${video._id}/video`);
        onRefresh();
      },
      {
        showToast: true,
        successMsg: "Video deleted successfully",
        errorMsg: "Failed to delete video",
      },
    );
  };

  return (
    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      {/* Thumbnail Area */}
      <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500">
            No Thumbnail
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5">
          <Clock size={12} /> {formatDuration(video.duration * 60)}
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {getStatusBadge()}
          <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            {video.playbackType}
          </span>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Quick Actions Dropdown (Simulated for UI, can use native title/hover for now) */}
          <ConfirmDialog
            title="Delete Video File"
            description={`Are you sure you want to remove the video for "${video.title}"? The lesson will remain but the video file will be permanently deleted from storage.`}
            variant="danger"
            confirmText="Delete Video"
            onConfirm={handleDeleteVideo}
          >
            <button className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-1.5 rounded-lg transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          </ConfirmDialog>
        </div>

        <div className="space-y-1.5 mt-auto pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
            Course:{" "}
            <span className="text-slate-700 dark:text-slate-300">
              {video.course?.title || "Unknown Course"}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Section: {video.section?.title || "Unassigned"}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 font-medium">
            {formatSize(video.videoSize * 1024 * 1024)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {video.uploadedAt ? (
              <DynamicDate
                date={video.uploadedAt}
                enableExpand
                stopPropgation
                formatType="hybrid-reverse"
                className="text-xs"
              />
            ) : (
              "Date Unknown"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
