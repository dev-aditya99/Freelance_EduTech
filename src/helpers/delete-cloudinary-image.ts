import cloudinary from "@/lib/cloudinary";
import { handleApiError } from "@/lib/handle-api-error";

export async function deleteCloudinaryImage(publicId?: string) {
  if (!publicId) return;

  try {
    console.log("publicId : ", publicId);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    console.log(result);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    handleApiError(error);
  }
}
