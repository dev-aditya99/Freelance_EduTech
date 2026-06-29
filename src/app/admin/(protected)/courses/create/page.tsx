"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import Link from "next/link";
import { CourseForm } from "@/components/admin/courses/CourseForm";

// Mock Components for Steps to keep it modular
const BasicInfoStep = () => (
  <div className="space-y-6">
    <div>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
        Course Title *
      </label>
      <input
        type="text"
        placeholder="e.g. Advanced Machine Learning"
        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
      />
    </div>
    <div>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
        Course Description *
      </label>
      <textarea
        rows={5}
        placeholder="Detail what students will learn..."
        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all resize-none"
      />
    </div>
  </div>
);

const PricingStep = () => (
  <div className="space-y-6">
    <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl">
      <h3 className="text-sm font-bold text-blue-900 dark:text-blue-400 mb-4">
        Pricing & Accessibility
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Course Price (₹)
          </label>
          <input
            type="number"
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
          />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Free Course
            </p>
            <p className="text-xs text-slate-500">
              Available to all registered users
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const STEPS = [
  { id: 1, title: "Basic Info", desc: "Title & Details" },
  { id: 2, title: "Pricing", desc: "Cost & Access" },
  { id: 3, title: "Curriculum", desc: "Modules & Lessons" },
  { id: 4, title: "Settings", desc: "Privacy & Certs" },
];

export default function CreateCoursePage() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      <CourseForm isEditing={false} />
    </div>
  );
}
