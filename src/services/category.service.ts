import { adminApi } from "@/lib/admin-api";

export const getCategories = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
}) => {
  const { data } = await adminApi.get("/admin/categories", {
    params,
  });

  return data;
};

export const getCategory = async (id: string) => {
  const { data } = await adminApi.get(`/admin/categories/${id}`);
  return data;
};

export const createCategory = async (payload: {
  name: string;
  description?: string;
  image?: string;
  parentCategory?: string | null;
  sortOrder?: number;
}) => {
  const { data } = await adminApi.post("/admin/categories", payload);

  return data;
};

export const updateCategory = async (id: string, payload: any) => {
  const { data } = await adminApi.patch(`/admin/categories/${id}`, payload);

  return data;
};

export const toggleCategoryStatus = async (id: string) => {
  const { data } = await adminApi.patch(`/admin/categories/${id}/status`);

  return data;
};

export const deleteCategory = async (id: string) => {
  const { data } = await adminApi.delete(`/admin/categories/${id}`);

  return data;
};
