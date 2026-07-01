import { adminApi } from "@/lib/admin-api";

export const getEnrollments = async (params?: any) => {
  const { data } = await adminApi.get("/admin/enrollments", { params });
  return data;
};

export const updateEnrollmentStatus = async (id: string, status: string) => {
  const { data } = await adminApi.patch(`/admin/enrollments/${id}/status`, {
    status,
  });
  return data;
};
