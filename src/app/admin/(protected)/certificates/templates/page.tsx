"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, CheckCircle, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCertificateStore } from "@/store/certificate.store";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { uploadImage } from "@/services/upload.service";
import toast from "react-hot-toast";

export default function CertificateTemplatesPage() {
  const router = useRouter();
  const { templates, fetchTemplates, createTemplate, setDefaultTemplate } =
    useCertificateStore();
  const { execute, isLoading } = useAsyncHandler();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleUploadNewTemplate = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await execute(
      async () => {
        // 1. Upload to Cloudinary/R2
        const uploaded = await uploadImage(file, "certificate_templates");

        // 2. Save in DB
        await createTemplate({
          name: `Template - ${new Date().toLocaleDateString()}`,
          backgroundUrl: uploaded.imageUrl,
          backgroundPublicId: uploaded.publicId,
          isDefault: templates.length === 0 ? true : false, // Pheli hamesha default
        });
      },
      { showToast: true, successMsg: "New template added successfully!" },
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Issued Certificates
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Certificate Templates
          </h1>
        </div>

        {/* Hidden Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUploadNewTemplate}
          accept="image/*"
          className="hidden"
        />

        <DynamicButton
          variant="primary"
          leftIcon={<Plus size={16} />}
          isLoading={isLoading("upload_template")}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload New Template
        </DynamicButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template._id}
            className={`bg-white dark:bg-[#111] border-2 rounded-2xl overflow-hidden shadow-sm transition-all group ${template.isDefault ? "border-blue-500" : "border-slate-200 dark:border-slate-800 hover:border-blue-300"}`}
          >
            <div className="relative aspect-[1.414/1] bg-slate-100 dark:bg-slate-900">
              <img
                src={template.backgroundUrl}
                alt={template.name}
                className="w-full h-full object-cover"
              />

              {/* Overlay Actions */}
              {!template.isDefault && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <DynamicButton
                    variant="primary"
                    size="sm"
                    onClick={() => setDefaultTemplate(template._id)}
                  >
                    Set as Default
                  </DynamicButton>
                </div>
              )}

              {template.isDefault && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <CheckCircle size={14} /> Active Default
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="font-semibold text-slate-900 dark:text-white">
                {template.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Make sure you upload high-res 16:9 images.
              </p>
            </div>
          </div>
        ))}

        {/* Upload Placeholder Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors aspect-[1.414/1]"
        >
          <ImageIcon size={32} className="text-slate-400 mb-2" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Add New Template
          </p>
          <p className="text-xs text-slate-500">
            Supports PNG, JPG (1920x1080)
          </p>
        </div>
      </div>
    </div>
  );
}
