// src/components/admin/courses/CourseForm.tsx
"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  UploadCloud,
  X,
  Plus,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CourseLevel,
  CourseLanguage,
  CourseStatus,
} from "@/types/course.types";
import {
  createCourse,
  deleteCourseThumbnail,
  publishCourse,
  updateCourse,
} from "@/services/course.service";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { uploadImage } from "@/services/upload.service";
import { DynamicSearchSelect } from "@/components/ui/DynamicSearchSelect";
import { getCategories } from "@/services/category.service";
import { getAllInstructors } from "@/services/instructors.service"; //  Added Instructor Service
import toast from "react-hot-toast";
import Image from "next/image";

const STEPS = [
  { id: 1, title: "Basic Info", desc: "Title, Category & Details" },
  { id: 2, title: "Media", desc: "Thumbnail Image" },
  { id: 3, title: "Pricing", desc: "Cost & Access" },
  { id: 4, title: "Content", desc: "Requirements & Goals" },
  { id: 5, title: "Settings", desc: "Level, Language & SEO" },
];

export function CourseForm({
  initialData = null,
  isEditing = false,
}: {
  initialData?: any;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // FORM STATES
  const [formData, setFormData] = useState({
    _id: initialData?._id || "",
    title: initialData?.title || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    thumbnail: initialData?.thumbnail || "",
    thumbnailPublicId: initialData?.thumbnailPublicId || "",
    category: initialData?.category?._id || initialData?.category || "",
    instructor: initialData?.instructor?._id || initialData?.instructor || "", //  Instructor State Setup
    isFree: initialData?.isFree || false,
    price: initialData?.price || "",
    discountPrice: initialData?.discountPrice || "",
    level: initialData?.level || CourseLevel.BEGINNER,
    course_language: initialData?.course_language || CourseLanguage.ENGLISH,
    status: initialData?.status || CourseStatus.DRAFT,
    isPublished: initialData?.isPublished || false,
    isFeatured: initialData?.isFeatured || false,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
  });

  // Dynamic Array States
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(
    initialData?.whatYouWillLearn || [],
  );
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || [],
  );
  const [targetAudience, setTargetAudience] = useState<string[]>(
    initialData?.targetAudience || [],
  );
  const [seoKeywords, setSeoKeywords] = useState<string[]>(
    initialData?.seoKeywords || [],
  );

  // Image States
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.thumbnail || null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const DynamicListInput = ({ title, items, setItems, placeholder }: any) => {
    const [input, setInput] = useState("");
    const handleAdd = () => {
      if (input.trim() && !items.includes(input.trim())) {
        setItems([...items, input.trim()]);
        setInput("");
      }
    };
    return (
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
          {title}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAdd())
            }
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item: string, idx: number) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300"
            >
              {item}
              <button
                type="button"
                onClick={() =>
                  setItems(items.filter((i: string) => i !== item))
                }
                className="text-slate-400 hover:text-rose-500"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setImageError("Image must be less than 6MB.");
      return;
    }
    setImageError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  //  THIS WAS MISSING. RESTORED EXACTLY AS YOU HAD IT.
  const handleSteps = (nextStep: number) => {
    if (currentStep == 1) {
      if (
        !formData.title ||
        !formData.category ||
        !formData.shortDescription ||
        !formData.description
      ) {
        toast.error("Please fill required fields!");
        return;
      }
    }

    if (currentStep == 3) {
      if (!formData.isFree) {
        if (!formData.price || !formData.discountPrice) {
          toast.error("Please fill required fields!");
          return;
        }
      }
    }

    if (currentStep == 4) {
      if (
        whatYouWillLearn.length == 0 ||
        requirements.length == 0 ||
        targetAudience.length == 0
      ) {
        toast.error("Please fill required fields!");
        return;
      }
    }

    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      setCurrentStep((p) => Math.min(p + 1, STEPS.length));
    }
  };

  // Handle Course Save
  const handleSave = async () => {
    try {
      if (
        !formData.title ||
        !formData.category ||
        !formData.shortDescription ||
        !formData.description
      ) {
        toast.error("Please fill required fields!");
        return;
      }

      if (!formData.isFree) {
        if (!formData.price || !formData.discountPrice) {
          toast.error("Please fill required fields!");
          return;
        }
      }

      setLoading(true);

      const payload = {
        ...formData,
        instructor: formData.instructor || null,
      };

      let data: any;
      if (isEditing) {
        data = await updateCourse(formData._id, payload);
      } else {
        data = await createCourse(payload);
      }

      setFormData((prev) => ({ ...prev, _id: data.course?._id || prev._id }));
      setCurrentStep(4);
    } catch (error: any) {
      console.log(error);
      const backendMessage =
        error?.response?.data?.message ||
        error.message ||
        "Unable to Create the course!";
      toast.error(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update Course
  const handleUpdate = async () => {
    try {
      setLoading(true);
      let thumbnail = undefined;
      let thumbnailPublicId = undefined;

      if (imageFile) {
        if (formData?.thumbnailPublicId) {
          const isDeleted = await deleteCourseThumbnail(
            formData?._id,
            formData?.thumbnailPublicId,
          );

          if (!isDeleted?.success) {
            toast.error(
              "Unable to save the course, because failed to delete old image!",
            );
            return;
          }
        }

        const uploaded = await uploadImage(imageFile, "course_thumbnails");
        thumbnail = uploaded.imageUrl;
        thumbnailPublicId = uploaded.publicId;
      }

      let formNewData = {
        ...formData,
        thumbnail,
        thumbnailPublicId,
        instructor: formData.instructor || null,
        whatYouWillLearn,
        requirements,
        targetAudience,
        seoKeywords,
      };

      let data: any;
      data = await updateCourse(formData._id, { ...formNewData });
      setFormData(data);
      toast.success(data?.message || "Course Updated!");
      router.replace("/admin/courses");
    } catch (error: any) {
      console.log(error);
      const backendMessage =
        error?.response?.data?.message ||
        error.message ||
        "Unable to update the course!";
      toast.error(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // Publish the course
  const handlePublish = async () => {
    try {
      setPublishLoading(true);
      if (!formData._id) {
        toast.error("Course id required!");
      }
      const data = await publishCourse(formData._id);

      if (data) {
        setFormData(data);
        router.replace("/admin/courses");
      }
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong!";
      toast.error(backendMessage);
    } finally {
      setPublishLoading(false);
    }
  };

  // STEP RENDERS
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Title */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Course Title *
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="e.g. Master React Native"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                />
              </div>

              {/* Category Search */}
              <div className="z-[60]">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Category *
                </label>
                <DynamicSearchSelect
                  value={formData.category}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, category: val }))
                  }
                  defaultItem={initialData?.category || null}
                  fetchFn={async (query) => {
                    try {
                      const res = await getCategories({
                        search: query,
                        limit: 10,
                      });
                      return res?.categories || [];
                    } catch (error) {
                      return [];
                    }
                  }}
                  placeholder="Search and select category..."
                />
              </div>

              {/*  Instructor Search */}
              <div className="z-50">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
                  <span>Instructor (Optional)</span>
                  {formData.instructor && (
                    <button
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, instructor: "" }))
                      }
                      className="text-[10px] text-rose-500 hover:underline uppercase"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <DynamicSearchSelect
                  value={formData.instructor}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, instructor: val }))
                  }
                  defaultItem={
                    initialData?.instructor?.fullName
                      ? {
                          _id: initialData.instructor._id,
                          name: initialData.instructor.fullName,
                          slug: initialData.instructor.slug,
                          profileImage: initialData.instructor.profileImage,
                        }
                      : null
                  }
                  fetchFn={async (query) => {
                    try {
                      const res = await getAllInstructors(query);
                      return (
                        res?.instructors?.map((i: any) => ({
                          ...i,
                          name: i.fullName,
                        })) || []
                      );
                    } catch (error) {
                      return [];
                    }
                  }}
                  placeholder="Search and assign instructor..."
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Short Description (Max 100 chars) *
              </label>
              <textarea
                name="shortDescription"
                value={formData?.shortDescription}
                onChange={handleInputChange}
                maxLength={100}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all resize-none"
              />
              <p className="text-xs text-slate-500 text-right mt-1">
                {formData?.shortDescription?.length}/100
              </p>
            </div>

            {/* Long Description */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Full Description *
              </label>
              <textarea
                name="description"
                value={formData?.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all resize-none"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div
              className={`relative w-full h-[300px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${imageError ? "border-rose-300 bg-rose-50 dark:border-rose-900/50" : "border-slate-300 bg-slate-50 dark:border-slate-800 dark:bg-[#0A0A0A] hover:border-blue-500"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview || "https://placehold.co/1280x720"}
                    alt="Preview"
                    width={1280}
                    height={1280}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold">
                      Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    Upload Course Thumbnail
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    JPEG, PNG, WEBP. Max 2MB.
                  </p>
                  <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">
                    Recommended: 1280x720px (16:9)
                  </p>
                </div>
              )}
            </div>
            {imageError && (
              <p className="flex items-center gap-1.5 text-sm text-rose-600 font-medium">
                <AlertCircle size={16} /> {imageError}
              </p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-5 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <input
                type="checkbox"
                name="isFree"
                value={formData.isFree as any}
                checked={formData.isFree}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Free Course
                </p>
                <p className="text-xs text-slate-500">
                  Enable to offer this course for free to all registered users.
                </p>
              </div>
            </div>
            {!formData.isFree && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-[#0A0A0A] rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Regular Price (₹)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Discount Price (₹) (Optional)
                  </label>
                  <input
                    name="discountPrice"
                    type="number"
                    min="0"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <DynamicListInput
              title="What You Will Learn"
              items={whatYouWillLearn}
              setItems={setWhatYouWillLearn}
              placeholder="e.g. Build fullstack apps with Next.js..."
            />
            <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
            <DynamicListInput
              title="Requirements"
              items={requirements}
              setItems={setRequirements}
              placeholder="e.g. Basic understanding of JavaScript..."
            />
            <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
            <DynamicListInput
              title="Target Audience"
              items={targetAudience}
              setItems={setTargetAudience}
              placeholder="e.g. Beginners looking to learn React..."
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Course Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white appearance-none"
                >
                  {Object.values(CourseLevel).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Language
                </label>
                <select
                  name="course_language"
                  value={formData.course_language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white appearance-none"
                >
                  {Object.values(CourseLanguage).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Search Engine Optimization (SEO)
              </h3>
              <input
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                type="text"
                placeholder="Meta Title (Max 60 chars)"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
              />
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleInputChange}
                rows={3}
                placeholder="Meta Description (Max 160 chars)"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white resize-none"
              />
              <DynamicListInput
                title="SEO Keywords"
                items={seoKeywords}
                setItems={setSeoKeywords}
                placeholder="e.g. react, nextjs, frontend..."
              />
            </div>

            <div className="flex items-center gap-3 p-5 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData?.isFeatured || false}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500/20"
              />
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-500">
                  Feature this course
                </p>
                <p className="text-xs text-amber-700/70 dark:text-amber-500/70">
                  Featured courses show up on the homepage hero section.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Courses
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditing
              ? `Edit: ${formData?.title || "Course"}`
              : "Add New Course"}
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isEditing && formData.status == "DRAFT" ? (
            <p className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-200 dark:bg-[#111] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-00 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-[#1A1A1A]">
              Saved to Draft
            </p>
          ) : (
            <DynamicButton
              onClick={handleUpdate}
              isLoading={loading}
              disabled={loading}
            >
              Save Changes
            </DynamicButton>
          )}
          <DynamicButton
            onClick={() => handlePublish()}
            disabled={formData.isPublished || publishLoading}
            isLoading={publishLoading}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-blue-600/20 ${formData.isPublished ? "bg-blue-100 text-primary cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"}`}
          >
            {formData.isPublished ? "Published" : "Publish"}
          </DynamicButton>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] p-4 sm:p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar">
        <div className="flex items-center min-w-[700px] justify-between">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className="flex items-center flex-1 last:flex-none relative cursor-pointer shrink-0 text-nowrap"
              onClick={() => handleSteps(step.id)}
            >
              <div className="flex items-center gap-3 z-10 relative bg-white dark:bg-[#111] pr-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep > step.id ? "bg-blue-600 text-white" : currentStep === step.id ? "bg-blue-600 text-white ring-4 ring-blue-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                >
                  {currentStep > step.id ? <Check size={16} /> : step.id}
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${currentStep >= step.id ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{step.desc}</p>
                </div>
              </div>
              {idx !== STEPS.length - 1 && (
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full transition-colors duration-300 ${currentStep > step.id ? "bg-blue-600" : "bg-slate-100 dark:bg-slate-800"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 sm:p-8 flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            {currentStep}. {STEPS[currentStep - 1].title}
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#111]">
          <button
            onClick={() => setCurrentStep((p) => Math.max(p - 1, 1))}
            disabled={currentStep === 1}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Step
          </button>
          {currentStep === STEPS.length ? (
            <DynamicButton
              onClick={() => handleUpdate()}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm shadow-sm shadow-blue-600/20"
              isLoading={loading}
              disabled={loading}
              loaderVariant="dots"
            >
              Update & Save
            </DynamicButton>
          ) : currentStep === 3 && !isEditing ? (
            <DynamicButton
              onClick={() => handleSave()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm shadow-sm shadow-blue-600/20"
              isLoading={loading}
              disabled={loading}
              loaderVariant="dots"
              rightIcon={<ArrowRight size={16} />}
            >
              Create Course and Continue
            </DynamicButton>
          ) : (
            <button
              onClick={() => handleSteps(0)} //  Fixed missing handleSteps
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-sm shadow-sm"
            >
              Next Step <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
