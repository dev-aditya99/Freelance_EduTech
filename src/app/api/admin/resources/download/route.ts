import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import r2 from "@/lib/r2";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";

import { getCurrentUser } from "@/middlewares/auth.middleware";

import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";

import Lesson from "@/models/lesson.model";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const resourceId = searchParams.get("resourceId");

    if (!lessonId || !resourceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson Id and Resource Id are not found",
        },
        {
          status: 404,
        },
      );
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson not found",
        },
        {
          status: 404,
        },
      );
    }

    const resource = lesson.resources.find(
      (item) => item._id?.toString() === resourceId,
    );

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource not found",
        },
        {
          status: 404,
        },
      );
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: resource.storageKey,
    });

    const downloadUrl = await getSignedUrl(r2, command, {
      expiresIn: 300,
    });

    return NextResponse.json(
      {
        success: true,
        downloadUrl,
        expiresIn: 300,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return handleApiError(error);
  }
}
