import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";

import { getCurrentUser } from "@/middlewares/auth.middleware";

import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";

import Lesson, { LessonStatus, VideoStatus } from "@/models/lesson.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await connectDB();

    const { id } = await params;

    const lesson = await Lesson.findOne({
      _id: id,
      status: LessonStatus.PUBLISHED,
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

    if (lesson.videoStatus !== VideoStatus.READY) {
      return NextResponse.json(
        {
          success: false,
          message: "Video is not ready",
        },
        {
          status: 400,
        },
      );
    }

    // Preview Lesson
    if (!lesson.isPreview) {
      const user = await getCurrentUser(req);

      const enrollment = await Enrollment.findOne({
        user: user._id,

        course: lesson.course,

        status: EnrollmentStatus.ACTIVE,
      });

      if (!enrollment) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not enrolled in this course",
          },
          {
            status: 403,
          },
        );
      }
    }

    // HLS URL
    const playbackUrl = cloudinary.url(lesson.videoStorageKey!, {
      resource_type: "video",

      format: "m3u8",

      secure: true,
    });

    return NextResponse.json(
      {
        success: true,

        playbackType: lesson.playbackType,

        playbackUrl,

        duration: lesson.duration,

        expiresIn: 300,
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

        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
