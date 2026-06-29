import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import r2 from "@/lib/r2";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import { AdminRole } from "@/models/admin.model";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const admin = await getCurrentAdmin(req);

    if (admin?.role !== AdminRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { fileName, contentType, courseId, lessonId } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        {
          success: false,
          message: "File name and content type are required",
        },
        {
          status: 400,
        },
      );
    }

    const storageKey = `courses/${courseId}/lessons/${lessonId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 300,
    });

    return NextResponse.json(
      {
        success: true,
        uploadUrl,
        storageKey,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}
