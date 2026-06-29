import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import { uploadImage } from "@/helpers/upload-image";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const formData = await req.formData();

    const file = formData.get("file") as File;

    const folder = (formData.get("folder") as string) || "edu-platform";

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "File required",
        },
        {
          status: 400,
        },
      );
    }

    const uploaded = await uploadImage(file, folder);

    return NextResponse.json(
      {
        success: true,
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      {
        status: 500,
      },
    );
  }
}
