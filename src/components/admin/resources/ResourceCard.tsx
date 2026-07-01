"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  FileArchive,
  FileImage,
  FileCode,
  File,
  Trash2,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { adminApi } from "@/lib/admin-api";
import { deleteResource, downloadResource } from "@/services/section.service";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { useUploader } from "@/hooks/useResourceUpload";
import { getFileIcon } from "../../../../utils/getFileTypeIcon";
import { getFileTypeFromMime } from "../../../../utils/getFileType";
import { DynamicDate } from "@/components/ui/DynamicDate";

export function ResourceCard({
  resource,
  onRefresh,
}: {
  resource: any;
  onRefresh: () => void;
}) {
  // custom hooks
  const { execute, isLoading } = useAsyncHandler();

  const formatSize = (bytes?: number) => {
    if (!bytes) return "-- MB";
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // const getFileIcon = () => {
  //   const type = resource.mimiType.include()
  //   switch (resource.type) {
  //     case "PDF":
  //       return <FileText size={28} className="text-rose-500" />;
  //     case "ZIP":
  //     case "RAR":
  //       return <FileArchive size={28} className="text-amber-500" />;
  //     case "IMAGE":
  //       return <FileImage size={28} className="text-emerald-500" />;
  //     case "CODE":
  //       return <FileCode size={28} className="text-blue-500" />;
  //     default:
  //       return <File size={28} className="text-slate-500" />;
  //   }
  // };

  const [resourceURL, setResourceURL] = useState<string | null>(null);

  const handleDelete = async () => {
    await execute(
      async () => {
        await deleteResource(resource.lessonId, resource._id);
        onRefresh();
      },
      {
        showToast: true,
        successMsg: "Resource deleted successfully",
        errorMsg: "Failed to delete resource",
      },
    );
  };

  const getResourceDownloadURL = async (
    lessonId: string,
    resourceId: string,
  ) => {
    let downURL = null;
    return await execute(
      async () => {
        downURL = await downloadResource(lessonId, resourceId);

        if (downURL) {
          setResourceURL(downURL?.downloadUrl);
          return downURL?.downloadUrl;
        }

        return null;
      },
      {
        loadingKey: `download_URL_resource_${resourceId}`,
        showToast: true,
        // successMsg: "Resource Downlaod URL Found!",
        errorMsg: "Failed to found Resource Downlaod URL",
      },
    );
  };

  const downloadResourceHandler = async (
    lessonId: string,
    resourceId: string,
  ) => {
    await execute(
      async () => {
        const resURL = await getResourceDownloadURL(lessonId, resourceId);
        if (resURL) {
          const response = await fetch(resURL);
          const blob = await response.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = resource?.originalName;
          link.click();
          URL.revokeObjectURL(link.href);
        }
      },
      {
        loadingKey: `download_resource_${resourceId}`,
        showToast: true,
        successMsg: "Resource Downlaoded!",
        errorMsg: "Failed to download resource",
        onError(error) {
          console.log(error);
        },
      },
    );
  };

  return (
    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
          {getFileIcon(getFileTypeFromMime(resource.mimeType))}
        </div>

        <div className="flex gap-2">
          {/* Download/View Button (Optional) */}
          {resource.storageKey && (
            <DynamicButton
              className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-colors shrink-0 cursor-pointer"
              onClick={() =>
                downloadResourceHandler(resource.lessonId, resource._id)
              }
              rightIcon={<Download size={16} />}
              variant="ghost"
              isLoading={isLoading(`download_resource_${resource._id}`)}
            />
          )}

          <ConfirmDialog
            title="Delete Resource File"
            description={`Are you sure you want to remove "${resource.title}"?`}
            variant="danger"
            confirmText="Delete File"
            onConfirm={handleDelete}
          >
            <button className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-xl transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          </ConfirmDialog>
        </div>
      </div>

      <div className="flex-1">
        <h3
          className="font-bold text-base font-sora text-slate-900 dark:text-white line-clamp-2 leading-snug mb-1"
          title={resource.title}
        >
          {resource.title}
        </h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-inter mb-4">
          {resource?.type && resource?.type !== "OTHER"
            ? resource?.type
            : resource?.mimeType}{" "}
          • {formatSize(resource?.size)}
        </p>

        <div className="space-y-2 font-inter border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Course:
            </span>{" "}
            {resource.course?.title || "Unknown"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Lesson:
            </span>{" "}
            {resource.lessonTitle || "Unknown"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 font-inter">
        <p className="text-[10px] text-slate-400 font-medium">
          Uploaded:{" "}
          {resource.uploadedAt ? (
            <DynamicDate
              date={resource.uploadedAt}
              enableExpand
              stopPropgation
              formatType="hybrid-reverse"
              className="text-xs"
            />
          ) : (
            "Unknown"
          )}
        </p>
      </div>
    </div>
  );
}
