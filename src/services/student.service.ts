import { adminApi } from "@/lib/admin-api";

export const getStudents = async (params?: any) => {
  const { data } = await adminApi.get("/admin/students", { params });
  return data;
};

export const toggleStudentBlockStatus = async (
  id: string,
  isBlocked: boolean,
) => {
  const { data } = await adminApi.patch(`/admin/students/${id}/toggle-block`, {
    isBlocked,
  });
  return data;
};
