"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useCategoryStore } from "@/store/category.store";

// Components Import
import { CategoryStats } from "@/components/admin/categories/CategoryStats";
import { CategoryFilters } from "@/components/admin/categories/CategoryFilters";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { CategoryFormModal } from "@/components/admin/categories/CategoryFormModal";

export default function CategoriesPage() {
  const {
    categories,
    stats,
    isLoading,
    fetchCategories,
    deleteCategory,
    toggleCategoryStatus,
    pagination,
  } = useCategoryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  useEffect(() => {
    fetchCategories({
      page: currentPage,
      search: searchQuery,
      status: statusFilter,
      sortOrder: sortOption,
    });
  }, [currentPage, searchQuery, statusFilter, sortOption, fetchCategories]);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await toggleCategoryStatus(id, newStatus);
  };

  const handleDelete = async (category: any) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      await deleteCategory(category._id);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize and structure your academic curriculum with ease.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Stats */}
      <CategoryStats stats={stats} />

      {/* Main Table Container */}
      <div className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
        <CategoryFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
        <CategoryTable
          categories={categories}
          isLoading={isLoading}
          pagination={pagination}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Form Modal (Create / Edit) */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}
