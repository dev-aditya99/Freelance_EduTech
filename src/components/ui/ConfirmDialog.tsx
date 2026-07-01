"use client";

import React, { useState, cloneElement, isValidElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { Dialog, DialogPortal } from "./dialog";

export type ConfirmVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  children: React.ReactNode; // The trigger element (button, div, etc.)
  className?: string;
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  children,
  className = "",
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Variant Styling Configuration
  const variantConfig = {
    danger: {
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      btnVariant: "danger" as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      btnVariant: "primary" as const, // Custom styling below if needed
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      btnVariant: "primary" as const,
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      btnVariant: "primary" as const,
    },
  };

  const currentConfig = variantConfig[variant];
  const Icon = currentConfig.icon;

  const handleOpen = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isLoading) return;
    setIsOpen(false);
  };

  const handleConfirm = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Intercept the onClick of the child element
  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        onClick: (e: any) => {
          handleOpen(e);
          // Agar bache ke paas pehle se onClick tha, toh usko bhi preserve karna zaroori nahi hai kyunki confirm hone pe chalega.
        },
      })
    : children;

  return (
    <>
      {trigger}

      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogPortal>
              <div
                className={`fixed inset-0 z-[999999999999] flex items-center justify-center p-4 ${className}`}
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleClose}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative w-full max-w-md bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-9999999"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${currentConfig.iconBg}`}
                      >
                        <Icon size={24} className={currentConfig.iconColor} />
                      </div>
                      <div className="pt-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                          {title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A0A0A] flex items-center justify-end gap-3">
                    <DynamicButton
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      {cancelText}
                    </DynamicButton>

                    <DynamicButton
                      variant={currentConfig.btnVariant}
                      onClick={handleConfirm}
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      {confirmText}
                    </DynamicButton>
                  </div>
                </motion.div>
              </div>
            </DialogPortal>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
