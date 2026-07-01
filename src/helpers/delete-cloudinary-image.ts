import cloudinary from "@/lib/cloudinary";
import { handleApiError } from "@/lib/handle-api-error";

export async function deleteCloudinaryImage(publicId?: string) {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    handleApiError(error);
  }
}
