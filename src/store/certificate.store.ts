import { create } from "zustand";
import { adminApi } from "@/lib/admin-api";

interface CertificateState {
  certificates: any[];
  templates: any[];
  pagination: any | null;
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;

  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;

  fetchCertificates: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createTemplate: (payload: any) => Promise<void>;
  setDefaultTemplate: (id: string) => Promise<void>;
}

export const useCertificateStore = create<CertificateState>((set, get) => ({
  certificates: [],
  templates: [],
  pagination: null,
  isLoading: false,
  searchQuery: "",
  currentPage: 1,

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchCertificates();
  },
  setPage: (page) => {
    set({ currentPage: page });
    get().fetchCertificates();
  },

  fetchCertificates: async () => {
    set({ isLoading: true });
    try {
      const { currentPage, searchQuery } = get();
      const { data } = await adminApi.get(
        `/admin/certificates?page=${currentPage}&search=${searchQuery}`,
      );
      set({ certificates: data.certificates, pagination: data.pagination });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTemplates: async () => {
    set({ isLoading: true });
    try {
      const { data } = await adminApi.get(`/admin/certificate-templates`);
      set({ templates: data.templates });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createTemplate: async (payload) => {
    await adminApi.post(`/admin/certificate-templates`, payload);
    await get().fetchTemplates();
  },

  setDefaultTemplate: async (id) => {
    await adminApi.patch(`/admin/certificate-templates/${id}/set-default`);
    await get().fetchTemplates();
  },
}));
