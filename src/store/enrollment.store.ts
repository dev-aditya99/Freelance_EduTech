import { create } from "zustand";
import {
  getEnrollments,
  updateEnrollmentStatus,
} from "@/services/enrollment.service";

interface EnrollmentState {
  enrollments: any[];
  pagination: any | null;
  isLoading: boolean;
  error: string | null;

  courseFilter: string;
  statusFilter: string;
  currentPage: number;

  setCourseFilter: (courseId: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;

  fetchEnrollments: () => Promise<void>;
  updateStatus: (id: string, newStatus: string) => Promise<void>;
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  enrollments: [],
  pagination: null,
  isLoading: false,
  error: null,

  courseFilter: "ALL",
  statusFilter: "ALL",
  currentPage: 1,

  setCourseFilter: (courseId) => {
    set({ courseFilter: courseId, currentPage: 1 });
    get().fetchEnrollments();
  },
  setStatusFilter: (status) => {
    set({ statusFilter: status, currentPage: 1 });
    get().fetchEnrollments();
  },
  setPage: (page) => {
    set({ currentPage: page });
    get().fetchEnrollments();
  },

  fetchEnrollments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { currentPage, courseFilter, statusFilter } = get();
      const queryParams: any = { page: currentPage, limit: 10 };
      if (courseFilter !== "ALL") queryParams.courseId = courseFilter;
      if (statusFilter !== "ALL") queryParams.status = statusFilter;

      const data = await getEnrollments(queryParams);
      set({ enrollments: data.enrollments || [], pagination: data.pagination });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id, newStatus) => {
    try {
      await updateEnrollmentStatus(id, newStatus);
      set((state) => ({
        enrollments: state.enrollments.map((env) =>
          env._id === id ? { ...env, status: newStatus } : env,
        ),
      }));
    } catch (error: any) {
      throw error;
    }
  },
}));
