"use client";

import React from "react";
import Image from "next/image";
import {
  Edit2,
  Trash2,
  Users,
  BookOpen,
  Briefcase,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { useInstructorStore } from "@/store/instructor.store"; // Update path if needed
import { IInstructor } from "@/types/instructor.types";
import { FaLinkedin, FaYoutube } from "react-icons/fa6";

interface InstructorCardProps {
  instructor: IInstructor;
  onEdit: (instructor: IInstructor) => void;
}

export function InstructorCard({ instructor, onEdit }: InstructorCardProps) {
  const { execute } = useAsyncHandler();
  const { removeInstructor } = useInstructorStore();

  const handleDelete = async () => {
    await execute(
      async () => {
        await removeInstructor(instructor._id);
      },
      {
        showToast: true,
        successMsg: "Instructor deleted successfully",
        // 🟢 Will display the backend error if instructor has assigned courses
        errorMsg: (err) =>
          err?.response?.data?.message || "Failed to delete instructor",
      },
    );
  };

  return (
    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
      {/* Top Banner (Cover Image) */}
      <div className="h-28 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 w-full relative">
        {instructor.coverImage && (
          <Image
            src={instructor.coverImage}
            alt={`${instructor.fullName} Cover`}
            fill
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${instructor.isActive ? "bg-emerald-500/90 text-white" : "bg-slate-500/90 text-white"}`}
          >
            {instructor.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Profile Image & Quick Actions */}
      <div className="px-6 relative -mt-12 mb-2 flex justify-between items-end">
        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#0A0A0A] p-1 shadow-sm border border-slate-200 dark:border-slate-800 relative z-10">
          {instructor.profileImage ? (
            <Image
              src={instructor.profileImage}
              alt={instructor.fullName}
              width={80}
              height={80}
              className="rounded-xl w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl font-bold text-slate-400">
              {instructor.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Edit & Delete Actions */}
        <div className="flex gap-2 relative z-10">
          <button
            onClick={() => onEdit(instructor)}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors shrink-0"
            title="Edit Instructor"
          >
            <Edit2 size={16} />
          </button>
          <ConfirmDialog
            title="Delete Instructor"
            description={`Are you sure you want to remove "${instructor.fullName}"? This action cannot be undone.`}
            variant="danger"
            confirmText="Delete"
            onConfirm={handleDelete}
            className="z-999999999999"
          >
            <button
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors shrink-0"
              title="Delete Instructor"
            >
              <Trash2 size={16} />
            </button>
          </ConfirmDialog>
        </div>
      </div>

      {/* Instructor Content */}
      <div className="p-6 pt-2 flex flex-col flex-1">
        <h3 className="font-bold text-lg font-sora text-slate-900 dark:text-white line-clamp-1">
          {instructor.fullName}
        </h3>

        {/* Shows Headline if available, fallback to Designation */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium mt-0.5">
          {instructor.headline || instructor.designation || "No designation"}
        </p>

        {/* Social & Contact Links */}
        <div className="flex items-center gap-3 mt-3">
          {instructor.linkedinUrl && (
            <a
              href={instructor.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="LinkedIn"
            >
              <FaLinkedin size={16} />
            </a>
          )}
          {instructor.youtubeUrl && (
            <a
              href={instructor.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-rose-500 transition-colors"
              title="YouTube"
            >
              <FaYoutube size={16} />
            </a>
          )}
          {instructor.websiteUrl && (
            <a
              href={instructor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Website"
            >
              <Globe size={16} />
            </a>
          )}
          {instructor.email && (
            <a
              href={`mailto:${instructor.email}`}
              className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title={instructor.email}
            >
              <Mail size={16} />
            </a>
          )}
          {instructor.phone && (
            <a
              href={`tel:${instructor.phone}`}
              className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title={instructor.phone}
            >
              <Phone size={16} />
            </a>
          )}
        </div>

        {/* Stats Section */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 font-inter">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Briefcase size={14} className="text-blue-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {instructor.experienceYears} Yrs
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <BookOpen size={14} className="text-amber-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {instructor.totalCourses} Courses
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={14} className="text-emerald-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {instructor.totalStudents} Students
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
