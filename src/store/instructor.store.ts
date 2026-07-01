import { create } from "zustand";
import {
  createInstructor,
  getAllInstructors,
  getInstructor,
  updateInstructor,
  deleteInstructor,
  deleteInstructorImages,
} from "@/services/instructors.service";
import { IInstructor } from "@/types/instructor.types";

interface InstructorState {
  instructors: IInstructor[];
  instructor: IInstructor | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchInstructors: (search?: string) => Promise<void>;
  fetchInstructor: (id: string) => Promise<void>;
  addInstructor: (payload: Partial<IInstructor>) => Promise<void>;
  editInstructor: (id: string, payload: Partial<IInstructor>) => Promise<void>;
  removeInstructor: (id: string) => Promise<void>;
  removeInstructorProfileImage: (
    id: string,
    profileImagePublicId: string | undefined,
    coverImagePublicId: string | undefined,
  ) => Promise<void>;
}

export const useInstructorStore = create<InstructorState>((set, get) => ({
  instructors: [],
  instructor: null,
  loading: false,
  error: null,

  fetchInstructors: async (search = "") => {
    try {
      set({ loading: true, error: null });
      const data = await getAllInstructors(search);
      set({ instructors: data.instructors || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchInstructor: async (id) => {
    try {
      set({ loading: true, error: null });
      const data = await getInstructor(id);
      set({ instructor: data.instructor });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addInstructor: async (payload) => {
    await createInstructor(payload);
    await get().fetchInstructors();
  },

  editInstructor: async (id, payload) => {
    await updateInstructor(id, payload);
    await get().fetchInstructor(id);
  },

  removeInstructor: async (id) => {
    await deleteInstructor(id);
    await get().fetchInstructors();
  },

  removeInstructorProfileImage: async (
    id,
    profileImagePublicId,
    coverImagePublicId,
  ) => {
    await deleteInstructorImages(id, profileImagePublicId, coverImagePublicId);
    await get().fetchInstructor(id);
  },
}));
