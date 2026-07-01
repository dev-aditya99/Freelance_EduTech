"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  Video as VideoIcon,
  FolderArchive,
  UploadCloud,
  Trash2,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Delete,
  Trash,
} from "lucide-react";
import { DynamicButton } from "@/components/ui/DynamicButton";
import {
  createLesson,
  deleteResource,
  getResourceURL,
  saveResource,
  updateLesson,
} from "@/services/section.service";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { useRouter } from "next/navigation";
import { isAllowedResourceFile } from "@/validations/file-validator";
import toast from "react-hot-toast";
import { useUploader } from "@/hooks/useResourceUpload";
import { DynamicProgress } from "@/components/ui/DynamicProgress";
import { uploadImage } from "@/services/upload.service";
import {
  deleteThumbnail,
  deleteVideo,
  getVideoUploadURL,
  updateThumbnailURL_ID,
  updateVideoLesson,
} from "@/services/video.service";
import getMediaDuration from "@/helpers/media-duration";
import { IAdmin } from "@/models/admin.model";
import Image from "next/image";
import { useNetworkManager } from "@/hooks/useNetworkManager";
import { deleteCloudinaryImage } from "@/helpers/delete-cloudinary-image";
import { Loader } from "@/components/ui/Loader";
import { DynamicDate } from "@/components/ui/DynamicDate";

interface IFormData {
  title: string;
  description: string;
  isPreview: boolean;
  isDownloadable: boolean;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  videoStorageKey?: string | null;
  videoPublicId: string;
  videoOriginalName?: string;
  videoSize?: number;
  videoMimeType?: string;
  uploadedBy?: IAdmin | null;
  uploadedAt: Date;
  status: string;
  duration: number;
}

export function LessonDrawer({
  isOpen,
  onClose,
  lesson,
  courseId,
  sectionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  lesson: any;
  courseId: string;
  sectionId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");

  // REFS FOR HIDDEN FILE INPUTS
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  // Custom Hooks
  const { execute, isLoading } = useAsyncHandler();
  const { uploadFile, cancelUpload, getProgress, getStatus, clearUploadState } =
    useUploader();

  // STATES
  const [formData, setFormData] = useState<IFormData>({
    title: lesson?.title || "",
    description: lesson?.description || "",
    isPreview: lesson?.isPreview || false,
    isDownloadable: lesson?.isDownloadable || false,
    thumbnailUrl: lesson?.thumbnailUrl || "",
    thumbnailPublicId: lesson?.thumbnailPublicId || "",
    videoPublicId: lesson?.videoPublicId || "video_public_id",
    videoStorageKey: lesson?.videoStorageKey || null,
    videoOriginalName: lesson?.videoOriginalName,
    videoSize: lesson?.videoSize,
    videoMimeType: lesson?.videoMimeType,
    uploadedBy: lesson?.uploadedBy || null,
    uploadedAt: lesson?.uploadedAt || null,
    status: lesson?.status || "DRAFT",
    duration: lesson?.duration || 0,
  });

  const [resources, setResources] = useState<any[]>(lesson?.resources || []);

  // Thumbnail Upload States
  const [imagePreview, setImagePreview] = useState<string | null>(
    lesson?.thumbnailUrl || null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  // Video Upload States
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Resource Upload States
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null);
  const [isUploadingResource, setIsUploadingResource] = useState(false);

  if (!isOpen) return null;

  // DRAG & DROP HANDLERS
  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropThumbnail = (e: React.DragEvent) => {
    preventDefaults(e);
    if (formData?.thumbnailUrl) {
      toast.error("First delete the existing thumbnail!");
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processThumbnailFile(e.dataTransfer.files[0]);
    }
  };

  const handleDropVideo = async (e: React.DragEvent) => {
    preventDefaults(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleIsAllowed = (file: any) => {
    const allowed = isAllowedResourceFile(file);
    if (!allowed) {
      toast.error(
        file
          ? `${file.type} is not allowed`
          : `This type of file is not allowed!`,
      );
      return false;
    }
    return true;
  };

  const handleDropResource = (e: React.DragEvent) => {
    preventDefaults(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const allowed = handleIsAllowed(e.dataTransfer.files[0]);
      if (!allowed) return;
      setNewResourceFile(e.dataTransfer.files[0]);
    }
  };

  // Process Thumbnail
  const processThumbnailFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only Images allowed!");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension != "jpeg" && extension != "jpg" && extension != "png") {
      toast.error("Invalid File Type");
      return;
    }

    const videoSize = Number((file.size / 1024).toFixed(2));
    if (videoSize <= 10) {
      toast.error("Minimum Size 10KB Required!");
      return;
    }

    if (videoSize >= 6000) {
      toast.error("Allowed Maximum Size 6MB!");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Process Video File
  const processVideoFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Only videos allowed!");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension != "mp4" && extension != "mov" && extension != "hls") {
      toast.error("Invalid File Type");
      return;
    }

    const videoDuration = await getMediaDuration(file);
    if (videoDuration <= 6) {
      toast.error("Video duration should be at least 60s");
      return;
    }

    const videoSize = Number((file.size / (1024 * 1024)).toFixed(2));
    if (videoSize <= 1) {
      toast.error("Minimum Size 5MB Required!");
      return;
    }

    if (videoSize >= 1000) {
      toast.error("Allowed Maximum Size 1GB!");
      return;
    }
    setVideoFile(file);
  };

  // Upload Thumbnail
  const confirmUploadThumbnail = async () => {
    if (!imageFile) {
      toast.error("Please select a thumbnail first!");
      return;
    }

    setIsUploadingThumb(true);
    try {
      const uploaded = await uploadImage(
        imageFile,
        `/lesson/${lesson?._id}/thumbnails`,
      );
      if (uploaded) {
        const data = await updateThumbnailURL_ID(lesson?._id, {
          thumbnailUrl: uploaded.imageUrl,
          thumbnailPublicId: uploaded.publicId,
        });

        // if (data) {
        //   setFormData((prev) => ({
        //     ...formData,
        //     thumbnailUrl: data.thumbnailUrl,
        //     thumbnailPublicId: data.thumbnailPublicId,
        //   }));
        // }
        setImageFile(null); // Upload done, hide confirm button

        toast.success("Thumbnail Uploaded!");
        return uploaded;
      }
    } catch (error) {
      toast.error("Thumbnail upload failed!");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Delete Thumbnail
  const deleteThumbnailHandler = async () => {
    await execute(
      async () => {
        const data = await deleteThumbnail(
          lesson._id,
          formData?.thumbnailPublicId,
        );
        if (data && data.lesson) {
          setFormData(data.lesson);
        }
      },
      {
        loadingKey: "delete_thumbnail",
        showToast: true,
        successMsg: "Thumbnail Deleted successfully!",
        errorMsg: "Failed to delete video.",
        onSuccess: () => {
          setVideoFile(null);
          setImagePreview(null);
          setImageFile(null);
        },
        onError: (error) => {
          console.log(error);
        },
      },
    );
  };

  // Confirm Upload Video
  const confirmUploadVideo = async () => {
    if (!videoFile) {
      toast.error("Please select a video!");
      return;
    }

    const videoDuration = await getMediaDuration(videoFile);

    await execute(
      async () => {
        if (!lesson._id) {
          toast.error("Lesson Id required!");
          return;
        }

        if (!courseId) {
          toast.error("Course Id required!");
          return;
        }

        const payload = {
          fileName: videoFile?.name,
          contentType: videoFile?.type,
          fileSize: videoFile?.size / (1024 * 1024),
          lessonId: lesson._id,
          courseId,
          sectionId,
        };

        const uploadedData = await getVideoUploadURL(payload);

        await uploadFile(
          "new_video_upload",
          uploadedData?.upload?.uploadUrl,
          videoFile,
        );

        const extension =
          payload.fileName.split(".").pop()?.toLowerCase() || "mp4";

        const updatedPayload = {
          videoStorageKey: uploadedData?.upload?.storageKey,
          videoOriginalName: payload?.fileName,
          videoMimeType: payload?.contentType,
          videoSize: payload?.fileSize,
          duration: (videoDuration / 60).toFixed(2),
          playbackType: extension === "mp4" ? "MP4" : "HLS",
          courseId,
        };

        const updatedLessonData = await updateVideoLesson(
          lesson._id,
          updatedPayload,
        );

        setFormData(updatedLessonData?.lesson);
      },
      {
        loadingKey: "upload_video",
        showToast: true,
        successMsg: "Video uploaded successfully!",
        errorMsg: "Failed to upload video.",
        onSuccess: () => {
          setVideoFile(null);
          clearUploadState("new_video_upload");
        },
        onError: (error) => {
          console.log(error);
          setImagePreview(null);
          setImageFile(null);
          setVideoFile(null);
          clearUploadState("new_video_upload");
        },
      },
    );
  };

  // Delete Lesson Video
  const deleteLessonVideo = async () => {
    await execute(
      async () => {
        const data = await deleteVideo(lesson?._id);
        if (data && data.lesson) {
          setFormData(data.lesson);
        }
      },
      {
        loadingKey: "delete_video",
        showToast: true,
        successMsg: "Video Deleted successfully!",
        errorMsg: "Failed to delete video.",
        onSuccess: () => {
          setVideoFile(null);
        },
        onError: (error) => {
          console.log(error);
          setImagePreview(null);
          setImageFile(null);
          setVideoFile(null);
        },
      },
    );
  };

  // Confirm Upload Resource
  const confirmUploadResource = async () => {
    if (!newResourceTitle.trim() || !newResourceFile) return;

    await execute(
      async () => {
        const payload = {
          fileName: newResourceTitle,
          contentType: newResourceFile.type,
          courseId,
          lessonId: lesson._id,
        };

        const response = await getResourceURL(payload);
        const uploadUrl = response.uploadUrl || response;
        const storageKey = response.storageKey || newResourceTitle;

        await uploadFile("new_resource_upload", uploadUrl, newResourceFile);

        const newResource = await saveResource(lesson._id, {
          title: newResourceTitle,
          storageKey: storageKey,
          type: newResourceFile.type.includes("pdf") ? "PDF" : "OTHER",
          originalName: newResourceFile.name,
          mimeType: newResourceFile.type,
          size: newResourceFile.size,
        });

        setResources(newResource?.resources);
        return newResource;
      },
      {
        loadingKey: "upload_resource",
        showToast: true,
        successMsg: "Resource uploaded successfully!",
        errorMsg: "Failed to upload resource.",
        onSuccess: () => {
          setIsAddingResource(false);
          setNewResourceTitle("");
          setNewResourceFile(null);
          clearUploadState("new_resource_upload");
        },
      },
    );
  };

  // Delete Resource
  const deleteResourceHandler = async (id: string) => {
    await execute(
      async () => {
        const data = await deleteResource(lesson?._id, id);
        return data;
      },
      {
        loadingKey: `delete_resource_${id}`,
        showToast: true,
        successMsg: "Resource Deleted successfully!",
        errorMsg: "Failed to delete resource.",
        onSuccess: (data) => {
          console.log(data);
          setResources(data?.resources);
        },
        onError: (error) => {
          console.log(error);
        },
      },
    );
  };

  // Save and Edit Lesson
  const handleSaveLesson = async () => {
    let data: any;

    await execute(
      async () => {
        if (lesson?._id) {
          data = await updateLesson(lesson?._id, { ...formData });
        } else {
          data = await createLesson(sectionId, { ...formData });
        }
        return data;
      },
      {
        loadingKey: `create_lesson${lesson._id}`,
        showToast: true,
        successMsg: lesson?._id
          ? "Lesson Updated Successfully!"
          : "Lesson Created Successfully!",
        errorMsg: lesson?._id
          ? "Unable to update lesson"
          : `Unable to create lesson`,
        onSuccess(data) {
          if (data) {
            setFormData(data?.lesson);
            onClose();
          }
        },
        onError(error) {
          console.log(error);
        },
      },
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        key={lesson?._id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={
          isUploadingThumb ||
          isLoading("upload_video") ||
          isLoading("upload_resource")
            ? undefined
            : onClose
        }
        className="fixed h-screen inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full sm:w-125 bg-white dark:bg-[#0A0A0A] shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {lesson?._id ? "Edit Lesson" : "Create Lesson"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage content, media and resources.
            </p>
          </div>
          <button
            onClick={
              isUploadingThumb ||
              isLoading("upload_video") ||
              isLoading("upload_resource")
                ? undefined
                : onClose
            }
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 bg-slate-50 dark:bg-[#111] shrink-0">
          {[
            { id: "general", icon: Settings, label: "General" },
            { id: "video", icon: VideoIcon, label: "Media" },
            { id: "resources", icon: FolderArchive, label: "Resources" },
          ].map((tab) => {
            if ((tab.id === "video" || tab.id === "resources") && !lesson._id) {
              return null;
            }
            return (
              <button
                key={tab.id}
                onClick={() => {
                  isUploadingThumb ||
                  isLoading("upload_video") ||
                  isLoading("upload_resource")
                    ? undefined
                    : setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl text-sm resize-none dark:text-white"
                />
              </div>

              <div className="space-y-3">
                {/* Free Preview  */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      Free Preview
                    </p>
                    <p className="text-xs text-slate-500">
                      Allow non-enrolled users to watch.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isPreview}
                    onChange={(e) =>
                      setFormData({ ...formData, isPreview: e.target.checked })
                    }
                    className="w-5 h-5 accent-blue-600 rounded"
                  />
                </div>

                {/* Allow Download  */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      Allow Download
                    </p>
                    <p className="text-xs text-slate-500">
                      Users can download this lesson video.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isDownloadable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isDownloadable: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-blue-600 rounded"
                  />
                </div>

                {/* Public or Draft  */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      Public
                    </p>
                    <p className="text-xs text-slate-500">
                      Make Public to the course
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.status == "PUBLISHED" ? true : false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.checked ? "PUBLISHED" : "DRAFT",
                      })
                    }
                    className="w-5 h-5 accent-blue-600 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEDIA (Video & Thumbnail) */}
          {activeTab === "video" && (
            // Thumbnail and Video
            <div className="space-y-8">
              {/* Thumbnail DROPZONE */}
              <div className="space-y-3">
                {/* Thumbnail Label  */}
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Lesson Thumbnail</span>
                  {imageFile && !isUploadingThumb && (
                    <span className="text-amber-500 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                      Pending Upload
                    </span>
                  )}
                </label>

                {/* Thumbnail Card  */}
                <div
                  onDragOver={preventDefaults}
                  onDragEnter={preventDefaults}
                  onDragLeave={preventDefaults}
                  onDrop={handleDropThumbnail}
                  onClick={() => {
                    formData?.thumbnailPublicId
                      ? deleteThumbnailHandler()
                      : thumbnailInputRef.current?.click();
                  }}
                  className={`relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all group ${imageFile ? "border-amber-400 bg-amber-50/10" : "border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-[#111]"}`}
                >
                  {/* thumbnail upload hidden input  */}
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={(e) => {
                      e.target.files?.[0] &&
                        processThumbnailFile(e.target.files[0]);
                    }}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingThumb}
                  />

                  {/* Thumbnail Preview  */}
                  {imagePreview ? (
                    <>
                      <Image
                        src={
                          imagePreview ||
                          `https://res.cloudinary.com/duvnw53vd/image/upload/v1782566560/q_auto/${formData?.thumbnailPublicId}.jpg`
                        }
                        alt="thumb"
                        fill
                        unoptimized
                        className="w-full h-full object-cover"
                        quality={70}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="https://placehold.co/300x300"
                      />
                      <div
                        className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 ${!isUploadingThumb && "group-hover:opacity-100"} transition-opacity`}
                      >
                        {formData?.thumbnailUrl ? (
                          isLoading("delete_thumbnail") ? (
                            <Loader />
                          ) : (
                            <Trash className="text-white mb-2" />
                          )
                        ) : (
                          <ImageIcon className="text-white mb-2" />
                        )}
                        <span className="text-white text-sm font-bold bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          {formData?.thumbnailUrl
                            ? "Delete and Replace"
                            : "Replace Image"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center p-4">
                      <ImageIcon size={28} className="text-slate-400 mb-2" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Drag & Drop or Click to Select
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        16:9 Aspect Ratio (JPEG, PNG)
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Confirm Upload Button */}
                <AnimatePresence>
                  {!formData?.thumbnailUrl && imageFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <DynamicButton
                        variant="primary"
                        isFullWidth
                        onClick={() =>
                          isUploadingThumb ? null : confirmUploadThumbnail()
                        }
                        isLoading={isUploadingThumb}
                        leftIcon={<UploadCloud size={16} />}
                        disabled={isUploadingThumb}
                      >
                        {isUploadingThumb ? "Uploading..." : "Upload"}
                      </DynamicButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

              {/* VIDEO DROPZONE */}
              <div className="space-y-3">
                {/* Video Label  */}
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Lesson Video</span>
                  {formData?.videoStorageKey && formData?.videoPublicId ? (
                    <span className="text-slate-700 text-xs font-medium bg-gray-100 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                      Uploaded
                    </span>
                  ) : videoFile &&
                    getStatus("new_video_upload") !== "idle" &&
                    isLoading("upload_video") ? (
                    <span className="text-blue-500 text-xs font-medium bg-blue-100 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                      Uploading...
                    </span>
                  ) : videoFile &&
                    getStatus("new_video_upload") == "idle" &&
                    isLoading("upload_video") ? (
                    <span className="text-gray-700 text-xs font-medium bg-gray-200 dark:bg-amber-900/20 px-2 py-0.5 rounded animate-pulse">
                      Processing...
                    </span>
                  ) : (
                    videoFile && (
                      <span className="text-amber-500 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                        Pending Upload
                      </span>
                    )
                  )}
                </label>

                {getStatus("new_video_upload") == "idle" &&
                  !formData?.videoStorageKey && (
                    <div
                      onDragOver={preventDefaults}
                      onDragEnter={preventDefaults}
                      onDragLeave={preventDefaults}
                      onDrop={handleDropVideo}
                      onClick={() => videoInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center text-center cursor-pointer transition-colors ${videoFile ? "border-amber-400 bg-amber-50/10" : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#111] hover:border-blue-500"}`}
                    >
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          processVideoFile(e.target.files[0])
                        }
                        accept="video/mp4,video/webm"
                        className="hidden"
                      />

                      {videoFile ? (
                        <>
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-full flex items-center justify-center mb-3">
                            <VideoIcon size={24} />
                          </div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[80%]">
                            {videoFile.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Ready to upload •{" "}
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-blue-600 mt-3 font-semibold hover:underline">
                            Click to change file
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mb-3">
                            <UploadCloud size={24} />
                          </div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            Drag & Drop Video Here
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            MP4, WebM (Max 5GB)
                          </p>
                          <span className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-300">
                            Browse Files
                          </span>
                        </>
                      )}
                    </div>
                  )}

                {formData?.videoStorageKey && (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center text-center transition-colors ${videoFile ? "border-amber-400 bg-amber-50/10" : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#111] hover:border-blue-500"}`}
                  >
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-full flex items-center justify-center mb-3">
                      <VideoIcon size={24} />
                    </div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[80%]">
                      {formData?.videoOriginalName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formData?.videoMimeType} •{" "}
                      {formData?.videoSize?.toFixed(2)} MB
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Uploaded By • {formData?.uploadedBy?.fullName}
                    </p>
                    <p>
                      <DynamicDate
                        date={formData?.uploadedAt}
                        enableExpand
                        stopPropgation
                        formatType="hybrid-reverse"
                      />
                    </p>

                    <DynamicButton
                      title="Delete Video"
                      rightIcon={<Trash size={14} color="#f00" />}
                      className="bg-transparent absolute top-1 right-1 cursor-pointer"
                      variant="ghost"
                      onClick={deleteLessonVideo}
                      isLoading={isLoading("delete_video")}
                    />
                  </div>
                )}

                {getStatus("new_video_upload") !== "idle" && (
                  <DynamicProgress
                    className="bg-transparent p-0 m-0"
                    circleSize={30}
                    variant="bar"
                    value={getProgress("new_video_upload")}
                    title={newResourceFile?.name}
                    fileType="video"
                    subtitle={`${videoFile?.name} • (${((videoFile?.size || 1024) / (1024 * 1024)).toFixed(2)}MB)`}
                    status={
                      getStatus("new_video_upload") === "cancelled"
                        ? "paused"
                        : getStatus("new_video_upload")
                    }
                    onCancel={() => cancelUpload("new_video_upload")}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-5">
              {/* Add New Resource Button (Hidden if inline form is open) */}
              {!isAddingResource && (
                <DynamicButton
                  variant="outline"
                  isFullWidth
                  leftIcon={<Plus size={16} />}
                  onClick={() => setIsAddingResource(true)}
                  disabled={isUploadingResource}
                >
                  Upload New Resource
                </DynamicButton>
              )}

              {/* INLINE RESOURCE UPLOADER FORM */}
              <AnimatePresence>
                {isAddingResource && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 sm:p-5 border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-blue-900 dark:text-blue-400">
                        Add New Resource
                      </h4>
                      <button
                        onClick={() => {
                          setIsAddingResource(false);
                          setNewResourceFile(null);
                          setNewResourceTitle("");
                          clearUploadState("new_resource_upload");
                        }}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Resource Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cheat Sheet PDF"
                        value={newResourceTitle}
                        onChange={(e) => setNewResourceTitle(e.target.value)}
                        disabled={isLoading("upload_resource")}
                        className="w-full px-3 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-lg text-sm disabled:opacity-50"
                      />
                    </div>

                    <div
                      onDragOver={preventDefaults}
                      onDragEnter={preventDefaults}
                      onDragLeave={preventDefaults}
                      onDrop={handleDropResource}
                      onClick={() =>
                        !isLoading("upload_resource") &&
                        resourceInputRef.current?.click()
                      }
                      className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center text-center transition-colors ${newResourceFile ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20" : "border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-[#0A0A0A] cursor-pointer"} ${isLoading("upload_resource") ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <input
                        type="file"
                        ref={resourceInputRef}
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          setNewResourceFile(e.target.files[0])
                        }
                        className="hidden"
                      />
                      {newResourceFile ? (
                        <>
                          <FileText size={24} className="text-amber-500 mb-2" />
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-full px-2">
                            {newResourceFile.name}
                          </p>
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-full px-2">
                            {newResourceFile.type} •{" "}
                            {(newResourceFile.size / (1024 * 1024)).toFixed(2)}
                            MB
                          </p>
                        </>
                      ) : (
                        <>
                          <UploadCloud
                            size={20}
                            className="text-slate-400 mb-2"
                          />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Drag & drop file or Browse
                          </p>
                        </>
                      )}
                    </div>

                    {getStatus("new_resource_upload") !== "idle" && (
                      <DynamicProgress
                        variant="circle"
                        value={getProgress("new_resource_upload")}
                        title={newResourceFile?.name}
                        fileType="file"
                        status={
                          getStatus("new_resource_upload") === "cancelled"
                            ? "paused"
                            : getStatus("new_resource_upload")
                        }
                        onCancel={() => cancelUpload("new_resource_upload")}
                      />
                    )}

                    <DynamicButton
                      variant="primary"
                      isFullWidth
                      onClick={confirmUploadResource}
                      isLoading={isLoading("upload_resource")}
                      disabled={
                        !newResourceTitle ||
                        !newResourceFile ||
                        getStatus("new_resource_upload") === "uploading"
                      }
                    >
                      Confirm & Save Resource
                    </DynamicButton>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Existing Resources List */}
              <div className="space-y-3 mt-6">
                {resources.length === 0 && !isAddingResource ? (
                  <p className="text-center text-sm text-slate-500 py-6">
                    No supplementary resources added yet.
                  </p>
                ) : (
                  resources.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111] hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {res?.title}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {res?.type}
                          </p>
                        </div>
                      </div>

                      <DynamicButton
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        onClick={() => deleteResourceHandler(res._id)}
                        variant="ghost"
                        rightIcon={<Trash2 size={16} />}
                        isLoading={isLoading(`delete_resource_${res._id}`)}
                        disabled={isLoading(`delete_resource_${res._id}`)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {activeTab === "general" && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A0A0A] flex justify-end gap-3 shrink-0">
            <DynamicButton variant="outline" onClick={onClose}>
              Cancel
            </DynamicButton>
            <DynamicButton
              isLoading={isLoading(`create_lesson${lesson._id}`)}
              variant="primary"
              onClick={handleSaveLesson}
            >
              {lesson?._id ? "Save Changes" : "Create"}
            </DynamicButton>
          </div>
        )}

        {activeTab === "video" && formData.videoStorageKey == null && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A0A0A] flex justify-end gap-3 shrink-0">
            {/* {formData.videoStorageKey == null && ( */}
            <DynamicButton
              isLoading={isLoading(`upload_video`)}
              variant="primary"
              onClick={confirmUploadVideo}
            >
              {isLoading(`upload_video`) ? "Uploading..." : "Upload"}
            </DynamicButton>
            {/* )} */}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
