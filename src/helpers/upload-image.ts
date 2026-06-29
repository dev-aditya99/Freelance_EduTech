import cloudinary from "@/lib/cloudinary";

export const uploadImage = async (file: File, folder: string) => {
  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  return new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          secure_url: result!.secure_url,
          public_id: result!.public_id,
        });
      },
    );

    stream.end(buffer);
  });
};
