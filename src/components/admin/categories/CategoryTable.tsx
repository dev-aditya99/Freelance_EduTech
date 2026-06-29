import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
  FolderOpen,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DynamicDate } from "@/components/ui/DynamicDate";

interface TableProps {
  categories: any[];
  isLoading: boolean;
  pagination: any;
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  onEdit: (cat: any) => void;
  onDelete: (cat: any) => void;
  onToggleStatus: (id: string, status: string) => void;
}

export function CategoryTable({
  categories,
  isLoading,
  pagination,
  currentPage,
  setCurrentPage,
  onEdit,
  onDelete,
  onToggleStatus,
}: TableProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 sm:w-1/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 sm:w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-center px-4 w-full">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <FolderOpen size={28} className="sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
          No categories found
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Get started by creating a new category.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="w-full -x-auto min-h-[350px] sm:min-h-[400px] pb-4 custom-scrollbar overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[1100px] overflow-x-auto">
          <thead className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/30 border-y border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wider">
                Category
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wider">
                Parent
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wider">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wider">
                Order
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wider">
                Created
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wider">
                Updated
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((cat: any) => (
              <tr
                key={cat._id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
              >
                {/* Image and Name  */}
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Image  */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden/ border border-slate-200 dark:border-slate-700">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-slate-400" />
                      )}
                    </div>

                    {/* Name and Slug  */}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {cat.name}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        /{cat.slug}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Parent name  */}
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <span className="text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    {cat.parentCategory?.name || "—"}
                  </span>
                </td>

                {/* Active Status  */}
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${
                      cat.isActive
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cat.isActive ? "bg-emerald-600 dark:bg-emerald-400" : "bg-rose-600 dark:bg-rose-400"}`}
                    ></span>
                    {cat.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>

                {/* Ordering  */}
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold border border-slate-100 dark:border-slate-700 text-xs sm:text-sm">
                    {cat.sortOrder || 0}
                  </div>
                </td>

                {/* Created At  */}
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  <DynamicDate
                    date={cat.createdAt}
                    formatType="hybrid-reverse"
                  />
                </td>

                {/* Updated At  */}
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  <DynamicDate
                    date={cat.updatedAt}
                    enableExpand
                    formatType="hybrid"
                  />
                </td>

                {/* Actions  */}
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(
                        activeDropdown === cat._id ? null : cat._id,
                      );
                    }}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Invisible overlay for outside click detection */}
                  {activeDropdown === cat._id && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(null);
                      }}
                    />
                  )}

                  <AnimatePresence>
                    {activeDropdown === cat._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-4 sm:right-8 top-10 w-40 sm:w-48 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-9999999 text-left"
                      >
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            onEdit(cat);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <Edit
                            size={16}
                            className="text-blue-600 dark:text-blue-400 shrink-0"
                          />{" "}
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            onToggleStatus(
                              cat._id,
                              cat.isActive ? "ACTIVE" : "INACTIVE",
                            );
                          }}
                          className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          {cat.isActive ? (
                            <>
                              <PowerOff
                                size={16}
                                className="text-amber-600 dark:text-amber-400 shrink-0"
                              />{" "}
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Power
                                size={16}
                                className="text-emerald-600 dark:text-emerald-400 shrink-0"
                              />{" "}
                              Activate
                            </>
                          )}
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 sm:my-1.5"></div>
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            onDelete(cat);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium"
                        >
                          <Trash2 size={16} className="shrink-0" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111]">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
          Showing{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {categories.length === 0 ? 0 : (currentPage - 1) * 10 + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {Math.min(currentPage * 10, pagination?.total || 0)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {pagination?.total || 0}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 sm:p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, pagination?.totalPages || 1),
              )
            }
            disabled={
              currentPage === pagination?.totalPages ||
              pagination?.totalPages === 0 ||
              !pagination?.totalPages
            }
            className="p-1.5 sm:p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
