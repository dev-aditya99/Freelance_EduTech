import { adminApi } from "@/lib/admin-api";

export const getVideoUploadURL = async (payload: any) => {
  const { data } = await adminApi.post(`/admin/videos/upload-url`, payload);
  return data;
};

export const updateVideoLesson = async (lessonId: string, payload: any) => {
  const { data } = await adminApi.patch(
    `/admin/lessons/${lessonId}/video`,
    payload,
  );
  return data;
};

export const deleteVideo = async (lessonId: string) => {
  const { data } = await adminApi.delete(`/admin/lessons/${lessonId}/video`);
  return data;
};

// getAllVideos
export const getAllVideos = async (params: string = "") => {
  const queryString = params ? `?${params}` : "";
  const { data } = await adminApi.get(
    `/admin/lessons/all_videos${queryString}`,
  );
  return data;
};

// Thumbnails
// Update Thumbnail URL and PublicID
export const updateThumbnailURL_ID = async (lessonId: string, payload: any) => {
  const { data } = await adminApi.patch(
    `/admin/lessons/${lessonId}/thumbnail`,
    payload,
  );
  return data;
};

// Delete
export const deleteThumbnail = async (
  lessonId: string,
  thumbnailPublicId: any,
) => {
  const { data } = await adminApi.delete(
    `/admin/lessons/${lessonId}/thumbnail?thumbnailPublicId=${thumbnailPublicId}`,
  );
  return data;
};
