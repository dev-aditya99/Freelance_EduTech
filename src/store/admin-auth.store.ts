import { create } from "zustand";

import {
  adminLogin,
  adminLogout,
  adminMe,
  refreshAdminToken,
} from "@/services/admin-auth.service";

interface Admin {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface State {
  admin: Admin | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  fetchAdmin: () => Promise<void>;
  setAdmin: (admin: Admin | null, token?: string) => void;
}

export const useAdminAuthStore = create<State>((set) => ({
  admin: null,
  isAuthenticated: false,
  loading: false,

  setAdmin: (admin, token) => {
    if (token) localStorage.setItem("admin_access_token", token);
    if (admin) localStorage.setItem("admin_data", JSON.stringify(admin));
    set({ admin, isAuthenticated: !!admin });
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const data = await adminLogin(email, password);
      localStorage.setItem("admin_access_token", data.accessToken);
      localStorage.setItem("admin_data", JSON.stringify(data.admin));

      set({
        admin: data.admin,
        isAuthenticated: true,
        loading: false,
      });

      return data;
    } catch (error) {
      set({
        loading: false,
      });

      throw error;
    }
  },

  logout: async () => {
    try {
      await adminLogout();
    } finally {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_data");

      set({
        admin: null,
        isAuthenticated: false,
      });
    }
  },

  fetchAdmin: async () => {
    try {
      let data;

      try {
        data = await adminMe();
      } catch {
        const refreshData = await refreshAdminToken();
        localStorage.setItem("admin_access_token", refreshData.accessToken);
        data = await adminMe();
      }

      set({
        admin: data.admin,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_data");

      set({
        admin: null,
        isAuthenticated: false,
      });
    }
  },
}));
