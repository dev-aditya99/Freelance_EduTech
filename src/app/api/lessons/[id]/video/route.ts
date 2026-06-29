import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import r2 from "@/lib/r2";

import Course from "@/models/course.model";
import Enrollment from "@/models/enrollment.model";
import Lesson, { PlaybackType, VideoStatus } from "@/models/lesson.model";

import { getCurrentUser } from "@/middlewares/auth.middleware";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

    const user = await getCurrentUser(req);
    const { id } = await params;

    // Lesson
    const lesson = await Lesson.findById(id)
      .select(
        `
        title
        course
        duration
        isPreview
        videoStatus
        playbackType
        videoStorageKey
        thumbnailUrl
      `,
      )
      .lean();

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
          message: "Video not available",
        },
        {
          status: 400,
        },
      );
    }

    // Preview Lesson
    if (!lesson.isPreview) {
      const course = await Course.findById(lesson.course).select("isFree");

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

      // Paid Course

      if (!course.isFree) {
        const enrollment = await Enrollment.findOne({
          user: user._id,
          course: lesson.course,
        }).select("_id");

        if (!enrollment) {
          return NextResponse.json(
            {
              success: false,
              message: "Course not purchased",
            },
            {
              status: 403,
            },
          );
        }
      }
    }

    // Generate Signed URL
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: lesson.videoStorageKey!,
    });

    const videoUrl = await getSignedUrl(r2, command, {
      expiresIn: 60 * 10, // 10 Minutes
    });

    return NextResponse.json(
      {
        success: true,

        video: {
          title: lesson.title,
          url: videoUrl,
          duration: lesson.duration,
          thumbnail: lesson.thumbnailUrl,
          playbackType: lesson.playbackType,
          expiresIn: 600,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}
