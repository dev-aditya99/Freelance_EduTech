import { adminApi } from "@/lib/admin-api";
import { CourseStatus } from "@/models/course.model";

export const getCourses = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const { data } = await adminApi.get("/admin/courses", { params });
  return data;
};

export const getCourse = async (id: string) => {
  const { data } = await adminApi.get(`/admin/courses/${id}`);
  return data;
};

export const createCourse = async (payload: any) => {
  const { data } = await adminApi.post("/admin/courses", payload);
  return data;
};

export const updateCourse = async (id: string, payload: any) => {
  const { data } = await adminApi.patch(`/admin/courses/${id}`, payload);
  return data;
};

export const toggleCourseStatus = async (id: string, status: string) => {
  const { data } = await adminApi.put(`/admin/courses/${id}/status`, status);
  return data;
};

export const publishCourse = async (id: string) => {
  const { data } = await adminApi.post(`/admin/courses/${id}/publish`);
  return data;
};

export const deleteCourse = async (id: string, action: CourseStatus) => {
  const { data } = await adminApi.delete(
    `/admin/courses/${id}?action=${action}`,
  );
  return data;
};

export const deleteCourseThumbnail = async (
  id: string,
  thumbnailPublicId: string,
) => {
  const { data } = await adminApi.delete(
    `/admin/courses/${id}/thumbnail?thumbnailPublicId=${thumbnailPublicId}`,
  );
  return data;
};
