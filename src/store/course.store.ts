import { create } from "zustand";
import { Course } from "@/types/course.types";
import {
  getCourses,
  createCourse,
  updateCourse,
  toggleCourseStatus,
  deleteCourse,
} from "@/services/course.service";

interface CourseState {
  courses: Course[];
  stats: any | null; // Tumhare backend ke hisaab se type add kar lena
  pagination: any | null;
  isLoading: boolean;
  error: string | null;

  // Local Filters State
  searchQuery: string;
  statusFilter: string;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;

  // Async API Actions
  fetchCourses: (params?: any) => Promise<void>;
  createCourse: (payload: any) => Promise<void>;
  updateCourse: (id: string, payload: any) => Promise<void>;
  toggleStatus: (id: string, currentStatus: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,

  searchQuery: "",
  statusFilter: "ALL",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  fetchCourses: async (params = {}) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const data = await getCourses(params);
      const courses = data.courses || [];

      set({
        courses,
        pagination: data.pagination,
        stats: {
          total: data.pagination?.total || 0,
          published: courses.filter((c: any) => c.status === "PUBLISHED")
            .length,
          draft: courses.filter((c: any) => c.status === "DRAFT").length,
          archived: courses.filter((c: any) => c.status === "ARCHIVED").length,
        },
      });
    } catch (error: any) {
      set({
        error: error.message,
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  createCourse: async (payload) => {
    try {
      await createCourse(payload);
    } catch (error: any) {
      throw error;
    }
  },

  updateCourse: async (id, payload) => {
    try {
      await updateCourse(id, payload);
    } catch (error: any) {
      throw error;
    }
  },

  toggleStatus: async (id, newStatus) => {
    try {
      const status = await toggleCourseStatus(id, newStatus);

      // Optimistic UI Update
      set((state) => ({
        courses: state.courses.map((c) => {
          return status;
        }),
      }));
    } catch (error: any) {
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      await deleteCourse(id);

      // Remove from UI immediately
      set((state) => ({
        courses: state.courses.filter(
          (c) => c._id !== id && (c as any)._id !== id,
        ),
      }));
    } catch (error: any) {
      throw error;
    }
  },
}));
