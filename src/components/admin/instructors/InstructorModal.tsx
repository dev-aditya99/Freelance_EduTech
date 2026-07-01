"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { useInstructorStore } from "@/store/instructor.store";
import { IInstructor } from "@/types/instructor.types";
import { uploadImage } from "@/services/upload.service";
import toast from "react-hot-toast";
import { instructorSchema } from "@/validations/instructor.schema";

interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructorToEdit?: IInstructor | null;
}

export function InstructorModal({
  isOpen,
  onClose,
  instructorToEdit,
}: InstructorModalProps) {
  const { execute, isLoading } = useAsyncHandler();
  const { addInstructor, editInstructor, removeInstructorProfileImage } =
    useInstructorStore();

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    designation: "",
    headline: "",
    bio: "",
    experienceYears: 0,
    linkedinUrl: "",
    youtubeUrl: "",
    websiteUrl: "",
    isActive: true,
  });

  useEffect(() => {
    if (instructorToEdit) {
      setFormData({
        fullName: instructorToEdit.fullName || "",
        email: instructorToEdit.email || "",
        phone: instructorToEdit.phone || "",
        designation: instructorToEdit.designation || "",
        headline: instructorToEdit.headline || "",
        bio: instructorToEdit.bio || "",
        experienceYears: instructorToEdit.experienceYears || 0,
        linkedinUrl: instructorToEdit.linkedinUrl || "",
        youtubeUrl: instructorToEdit.youtubeUrl || "",
        websiteUrl: instructorToEdit.websiteUrl || "",
        isActive: instructorToEdit.isActive !== false,
      });
      setProfilePreview(instructorToEdit.profileImage || null);
      setCoverPreview(instructorToEdit.coverImage || null);
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        designation: "",
        headline: "",
        bio: "",
        experienceYears: 0,
        linkedinUrl: "",
        youtubeUrl: "",
        websiteUrl: "",
        isActive: true,
      });
      setProfilePreview(null);
      setCoverPreview(null);
    }
    setProfileFile(null);
    setCoverFile(null);
  }, [instructorToEdit, isOpen]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === "profile") {
      setProfileFile(file);
      setProfilePreview(previewUrl);
    } else {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
  };

  const handleDeleteImage = async (type: "profile" | "cover") => {
    if (type === "profile") {
      if (profileFile) {
        // If it's just a locally selected file, clear it
        setProfileFile(null);
        setProfilePreview(instructorToEdit?.profileImage || null);
      } else if (
        instructorToEdit?._id &&
        instructorToEdit?.profileImagePublicId
      ) {
        // Delete existing image from backend
        await execute(
          async () => {
            await removeInstructorProfileImage(
              instructorToEdit._id,
              instructorToEdit.profileImagePublicId!,
              "",
            );
            setProfilePreview(null);
          },
          {
            loadingKey: "delete_media_profile",
            showToast: true,
            successMsg: "Profile image deleted successfully!",
          },
        );
      }
    } else {
      if (coverFile) {
        // If it's just a locally selected file, clear it
        setCoverFile(null);
        setCoverPreview(instructorToEdit?.coverImage || null);
      } else if (
        instructorToEdit?._id &&
        instructorToEdit?.coverImagePublicId
      ) {
        // Delete existing cover from backend
        await execute(
          async () => {
            await removeInstructorProfileImage(
              instructorToEdit._id,
              "",
              instructorToEdit.coverImagePublicId!,
            );
            setCoverPreview(null);
          },
          {
            loadingKey: "delete_media_cover",
            showToast: true,
            successMsg: "Cover image deleted successfully!",
            onError(error: any) {
              toast.error(
                error?.response?.data?.message ||
                  error?.message ||
                  "Unable to delete cover image",
              );
            },
          },
        );
      }
    }
  };

  // Save Instructor
  const handleSubmit = async () => {
    const validationResult = instructorSchema.safeParse(formData);

    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.issues[0].message;
      toast.error(firstErrorMessage);
      return;
    }

    if (!formData.fullName.trim()) return;

    await execute(
      async () => {
        let payload: any = { ...formData };

        if (profileFile) {
          const uploadedProfile = await uploadImage(
            profileFile,
            `/instructors/profiles`,
          );
          if (uploadedProfile) {
            payload.profileImage = uploadedProfile.imageUrl;
            payload.profileImagePublicId = uploadedProfile.publicId;
          }
        }

        if (coverFile) {
          const uploadedCover = await uploadImage(
            coverFile,
            `/instructors/covers`,
          );
          if (uploadedCover) {
            payload.coverImage = uploadedCover.imageUrl;
            payload.coverImagePublicId = uploadedCover.publicId;
          }
        }

        if (instructorToEdit) {
          await editInstructor(instructorToEdit._id, payload);
        } else {
          await addInstructor(payload);
        }
      },
      {
        loadingKey: "save_instructor",
        showToast: true,
        successMsg: instructorToEdit
          ? "Instructor updated successfully!"
          : "Instructor created successfully!",
        onSuccess: () => {
          onClose();
          window.location.reload();
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#111] w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {instructorToEdit ? "Edit Instructor" : "Add New Instructor"}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
            {/* Images Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Media
              </h4>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-semibold text-slate-500">
                    Cover Image
                  </label>
                  <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group">
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={(e) => handleImageChange(e, "cover")}
                      accept="image/*"
                      className="hidden"
                    />
                    {coverPreview ? (
                      <>
                        <img
                          src={coverPreview}
                          alt="cover"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <DynamicButton
                            variant="danger"
                            onClick={() => handleDeleteImage("cover")}
                            isLoading={isLoading("delete_media_cover")}
                            disabled={isLoading("delete_media_cover")}
                            className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50"
                            title="Delete Cover Image"
                            rightIcon={<Trash2 size={16} />}
                          />
                        </div>
                      </>
                    ) : (
                      <div
                        onClick={() => coverInputRef.current?.click()}
                        className="text-center w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0A0A0A] transition-colors"
                      >
                        <ImageIcon
                          size={24}
                          className="mx-auto text-slate-400 mb-1"
                        />
                        <span className="text-xs text-slate-500">
                          Upload Cover
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 shrink-0">
                  <label className="text-xs font-semibold text-slate-500">
                    Profile Image
                  </label>
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group">
                    <input
                      type="file"
                      ref={profileInputRef}
                      onChange={(e) => handleImageChange(e, "profile")}
                      accept="image/*"
                      className="hidden"
                    />
                    {profilePreview ? (
                      <>
                        <img
                          src={profilePreview}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <DynamicButton
                            variant="danger"
                            onClick={() => handleDeleteImage("profile")}
                            isLoading={isLoading("delete_media_profile")}
                            disabled={isLoading("delete_media_profile")}
                            className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50"
                            title="Delete Profile Image"
                            rightIcon={<Trash2 size={16} />}
                          />
                        </div>
                      </>
                    ) : (
                      <div
                        onClick={() => profileInputRef.current?.click()}
                        className="text-center w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0A0A0A] transition-colors"
                      >
                        <Camera
                          size={24}
                          className="mx-auto text-slate-400 mb-1"
                        />
                        <span className="text-[10px] text-slate-500">
                          Upload Profile
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) =>
                      setFormData({ ...formData, headline: e.target.value })
                    }
                    placeholder="e.g. Ex-Google Engineer"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    placeholder="e.g. Senior Developer"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Social Links
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedinUrl: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeUrl: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteUrl: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Bio
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0A0A0A] rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">
                  Active Status
                </p>
                <p className="text-xs text-slate-500">
                  Is this instructor currently active?
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-5 h-5 accent-blue-600 rounded"
              />
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-[#0A0A0A] shrink-0">
            <DynamicButton
              variant="outline"
              onClick={onClose}
              disabled={
                isLoading("save_instructor") || isLoading("delete_media")
              }
            >
              Cancel
            </DynamicButton>
            <DynamicButton
              variant="primary"
              onClick={handleSubmit}
              isLoading={isLoading("save_instructor")}
              disabled={isLoading("delete_media")}
            >
              Save Instructor
            </DynamicButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
