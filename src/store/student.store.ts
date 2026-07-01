import { create } from "zustand";
import {
  getStudents,
  toggleStudentBlockStatus,
} from "@/services/student.service";

interface StudentState {
  students: any[];
  pagination: any | null;
  isLoading: boolean;
  error: string | null;

  searchQuery: string;
  statusFilter: string; // "ALL" | "true" (Blocked) | "false" (Active)
  identityFilter: string;
  currentPage: number;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setIdentityFilter: (identity: string) => void;
  setPage: (page: number) => void;

  fetchStudents: (params?: any) => Promise<void>;
  toggleBlockStatus: (id: string, isBlocked: boolean) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  pagination: null,
  isLoading: false,
  error: null,

  searchQuery: "",
  statusFilter: "ALL",
  identityFilter: "ALL",
  currentPage: 1,

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchStudents();
  },
  setStatusFilter: (status) => {
    set({ statusFilter: status, currentPage: 1 });
    get().fetchStudents();
  },
  setIdentityFilter: (identity) => {
    set({ identityFilter: identity, currentPage: 1 });
    get().fetchStudents();
  },
  setPage: (page) => {
    set({ currentPage: page });
    get().fetchStudents();
  },

  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { currentPage, searchQuery, statusFilter, identityFilter } = get();

      const queryParams: any = { page: currentPage, limit: 10 };
      if (searchQuery) queryParams.search = searchQuery;
      if (statusFilter !== "ALL") queryParams.isBlocked = statusFilter;
      if (identityFilter !== "ALL") queryParams.identity = identityFilter;

      const data = await getStudents(queryParams);

      set({
        students: data.students || [],
        pagination: data.pagination,
      });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBlockStatus: async (id, isBlocked) => {
    try {
      const response = await toggleStudentBlockStatus(id, isBlocked);

      // Optimistic update
      set((state) => ({
        students: state.students.map((student) =>
          student._id === id
            ? { ...student, isBlocked: response.student.isBlocked }
            : student,
        ),
      }));
    } catch (error: any) {
      throw error;
    }
  },
}));
