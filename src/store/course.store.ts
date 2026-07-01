import { create } from "zustand";
import { Course } from "@/types/course.types";
import {
  getCourses,
  createCourse,
  updateCourse,
  toggleCourseStatus,
  deleteCourse,
  deleteCourseThumbnail,
} from "@/services/course.service";
import { CourseStatus } from "@/models/course.model";

interface CourseState {
  courses: Course[];
  stats: any | null; // Tumhare backend ke hisaab se type add kar lena
  pagination: any | null;
  isLoading: boolean;
  error: string | null;

  // Local Filters State
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;

  // Async API Actions
  fetchCourses: (params?: any) => Promise<void>;
  createCourse: (payload: any) => Promise<void>;
  updateCourse: (id: string, payload: any) => Promise<void>;
  toggleStatus: (id: string, currentStatus: string) => Promise<void>;
  deleteCourse: (id: string, action: CourseStatus) => Promise<void>;
  deleteCourseThumbnail: (
    id: string,
    thumbnailPublicId: string,
  ) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,
  searchQuery: "",
  statusFilter: "ALL",
  currentPage: 1,

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchCourses();
  },

  fetchCourses: async (params = {}) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const { currentPage } = get();
      const queryParams = { ...params, page: currentPage };

      const data = await getCourses(queryParams);
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

  deleteCourse: async (id, action) => {
    try {
      await deleteCourse(id, action);

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

  deleteCourseThumbnail: async (id, thumbnailPublicId) => {
    try {
      await deleteCourseThumbnail(id, thumbnailPublicId);
    } catch (error: any) {
      throw error;
    }
  },
}));
