import { adminApi } from "@/lib/admin-api";

export const uploadImage = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const { data } = await adminApi.post("/admin/upload-image", formData);
  return data;
};
