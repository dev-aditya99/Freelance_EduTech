import { adminApi } from "@/lib/admin-api";

export const getSections = async (courseId: string) => {
  const { data } = await adminApi.get(`/admin/courses/${courseId}/sections`);
  return data;
};

export const createSection = async (
  courseId: string,
  payload: {
    title: string;
  },
) => {
  const { data } = await adminApi.post(
    `/admin/courses/${courseId}/sections`,
    payload,
  );

  return data;
};

export const updateSection = async (
  sectionId: string,
  payload: {
    title?: string;
    sortOrder?: number;
  },
) => {
  const { data } = await adminApi.patch(
    `/admin/sections/${sectionId}`,
    payload,
  );

  return data;
};

export const deleteSection = async (sectionId: string) => {
  const { data } = await adminApi.delete(`/admin/sections/${sectionId}`);
  return data;
};

// Lessons
export const getLessons = async (sectionId: string) => {
  const { data } = await adminApi.get(`/admin/sections/${sectionId}/lessons`);
  return data;
};

export const createLesson = async (sectionId: string, payload: any) => {
  const { data } = await adminApi.post(
    `/admin/sections/${sectionId}/lessons`,
    payload,
  );

  return data;
};

export const updateLesson = async (lessonId: string, payload: any) => {
  const { data } = await adminApi.patch(`/admin/lessons/${lessonId}/`, payload);
  return data;
};

export const deleteLesson = async (lessonId: string) => {
  const { data } = await adminApi.delete(`/admin/lessons/${lessonId}/`);
  return data;
};

export const getResourceURL = async (payload: any) => {
  const { data } = await adminApi.post(`/admin/resources/upload-url`, payload);
  return data;
};

export const saveResource = async (lessonId: string, payload: any) => {
  const { data } = await adminApi.patch(
    `/admin/lessons/${lessonId}/resources`,
    payload,
  );
  return data;
};

export const deleteResource = async (lessonId: string, resourceId: string) => {
  const { data } = await adminApi.delete(
    `/admin/lessons/${lessonId}/resources?resourceId=${resourceId}`,
  );
  return data;
};

export const downloadResource = async (
  lessonId: string,
  resourceId: string,
) => {
  const { data } = await adminApi.get(
    `/admin/resources/download?lessonId=${lessonId}&resourceId=${resourceId}`,
  );
  return data;
};
