import { adminApi } from "@/lib/admin-api";

export const adminLogin = async (email: string, password: string) => {
  const { data } = await adminApi.post("/admin/auth/login", {
    email,
    password,
  });

  return data;
};

export const adminMe = async () => {
  const { data } = await adminApi.get("/admin/auth/me");
  return data;
};

export const adminLogout = async () => {
  const { data } = await adminApi.post("/admin/auth/logout");
  return data;
};

export const refreshAdminToken = async () => {
  const res = await fetch("/api/admin/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Refresh Failed");
  }

  return data;
};
