import { create } from "zustand";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "@/services/category.service";

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CategoryStore {
  categories: any[];

  stats: CategoryStats;

  isLoading: boolean;

  pagination: Pagination | null;

  fetchCategories: (params?: any) => Promise<void>;

  addCategory: (payload: any) => Promise<void>;

  editCategory: (id: string, payload: any) => Promise<void>;

  deleteCategory: (id: string) => Promise<void>;

  toggleCategoryStatus: (id: string, status: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],

  stats: {
    total: 0,
    active: 0,
    inactive: 0,
  },

  isLoading: false,

  pagination: null,

  fetchCategories: async (params = {}) => {
    try {
      set({
        isLoading: true,
      });

      const data = await getCategories(params);

      const categories = data?.categories || [];

      const active = categories.filter((cat: any) => cat.isActive).length;

      const inactive = categories.filter((cat: any) => !cat.isActive).length;

      set({
        categories,

        pagination: data.pagination,

        stats: {
          total: data.pagination?.total || categories.length,

          active,

          inactive,
        },
      });
    } catch (error) {
      console.error("Fetch Categories Error:", error);
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  addCategory: async (payload) => {
    try {
      await createCategory(payload);

      await get().fetchCategories();
    } catch (error) {
      console.error("Create Category Error:", error);

      throw error;
    }
  },

  editCategory: async (id, payload) => {
    try {
      await updateCategory(id, payload);

      await get().fetchCategories();
    } catch (error) {
      console.error("Update Category Error:", error);

      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await deleteCategory(id);

      await get().fetchCategories();
    } catch (error) {
      console.error("Delete Category Error:", error);

      throw error;
    }
  },

  toggleCategoryStatus: async (id, status) => {
    try {
      await toggleCategoryStatus(
        id,
        // status,
      );

      await get().fetchCategories();
    } catch (error) {
      console.error("Toggle Status Error:", error);

      throw error;
    }
  },
}));
