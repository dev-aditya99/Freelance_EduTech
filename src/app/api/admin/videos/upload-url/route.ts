import connectDB from "@/lib/db";
import r2 from "@/lib/r2";

import { handleApiError } from "@/lib/handle-api-error";

import { getCurrentAdmin } from "@/middlewares/admin.middleware";

import { AdminRole } from "@/models/admin.model";
import Course from "@/models/course.model";
import Lesson, { VideoStatus } from "@/models/lesson.model";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { NextRequest, NextResponse } from "next/server";

const MAX_VIDEO_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

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

    const { fileName, contentType, fileSize, lessonId, sectionId, courseId } =
      await req.json();

    // Validation
    if (!fileName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "File name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!contentType) {
      return NextResponse.json(
        {
          success: false,
          message: "Content type is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!fileSize || fileSize <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file size",
        },
        {
          status: 400,
        },
      );
    }

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson ID is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!sectionId) {
      {
        return NextResponse.json(
          {
            success: false,
            message: "Section ID is required",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        {
          status: 400,
        },
      );
    }

    // MIME Validation
    if (!ALLOWED_VIDEO_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported video format",
        },
        {
          status: 400,
        },
      );
    }

    // Size Validation
    if (fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum video size is 10GB",
        },
        {
          status: 400,
        },
      );
    }

    // Course Validation
    const course = await Course.findById(courseId).select("_id");

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        {
          status: 404,
        },
      );
    }

    // Lesson Validation
    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: courseId,
    });

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

    // Safe File Name
    const extension = fileName.split(".").pop()?.toLowerCase() || "mp4";

    const safeFileName = `${Date.now()}.${extension}`;

    // Storage Key
    const storageKey = `courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/video/${safeFileName}`;

    // Expiry
    let expiresIn = 900;

    if (fileSize > 500) expiresIn = 1800;
    if (fileSize > 1500) expiresIn = 3600;
    if (fileSize > 4000) expiresIn = 7200;

    // Generate Signed URL
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn,
    });

    // Update Lesson
    lesson.videoStatus = VideoStatus.UPLOADING;

    await lesson.save();

    // Response
    return NextResponse.json(
      {
        success: true,

        upload: {
          uploadUrl,
          storageKey,
          expiresIn,
          maxSize: MAX_VIDEO_SIZE,
          allowedTypes: ALLOWED_VIDEO_TYPES,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return handleApiError(error);
  }
}
