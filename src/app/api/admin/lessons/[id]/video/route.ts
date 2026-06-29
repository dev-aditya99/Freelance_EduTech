import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import r2 from "@/lib/r2";

import { getCurrentAdmin } from "@/middlewares/admin.middleware";

import { AdminRole } from "@/models/admin.model";
import Course from "@/models/course.model";
import Lesson, {
  LessonStatus,
  PlaybackType,
  VideoStatus,
} from "@/models/lesson.model";
import Section from "@/models/section.model";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
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

    const { id } = await params;

    const {
      videoStorageKey,
      videoOriginalName,
      videoMimeType,
      videoSize,
      duration,
      // thumbnailUrl,
      // thumbnailPublicId,
      playbackType,
      courseId,
    } = await req.json();

    // Validation
    if (!videoStorageKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Video storage key is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!videoOriginalName) {
      return NextResponse.json(
        {
          success: false,
          message: "Original file name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!videoMimeType) {
      return NextResponse.json(
        {
          success: false,
          message: "Video mime type is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!videoSize || videoSize <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid video size",
        },
        {
          status: 400,
        },
      );
    }

    if (duration === undefined || duration < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid duration",
        },
        {
          status: 400,
        },
      );
    }

    // Lesson
    const lesson = await Lesson.findById(id);

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

    // Section
    const section = await Section.findById(lesson.section);

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          message: "Section not found",
        },
        {
          status: 404,
        },
      );
    }

    // Course
    const course = await Course.findById(courseId);

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

    // Delete Previous Video
    if (lesson.videoStorageKey && lesson.videoStorageKey !== videoStorageKey) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: lesson.videoStorageKey,
          }),
        );

        section.totalDuration = Number(
          (section.totalDuration - lesson.duration).toFixed(2),
        );
        await section.save();

        course.totalDuration = Number(
          (course.totalDuration - lesson.duration).toFixed(2),
        );
        await course.save();
      } catch (error) {
        console.error("Old Video Delete Failed", error);

        return NextResponse.json(
          {
            success: false,
            message: "Old Video Delete Failed",
          },
          {
            status: 500,
          },
        );
      }
    }

    // Save New Video
    lesson.videoStorageKey = videoStorageKey;
    lesson.videoOriginalName = videoOriginalName;
    lesson.videoMimeType = videoMimeType;
    lesson.videoSize = videoSize;
    // lesson.thumbnailUrl = thumbnailUrl;
    // lesson.thumbnailPublicId = thumbnailPublicId;
    lesson.status = LessonStatus.PUBLISHED;
    lesson.duration = duration;
    lesson.playbackType = playbackType || PlaybackType.MP4;
    lesson.videoStatus = VideoStatus.READY;
    lesson.uploadedAt = new Date();
    lesson.uploadedBy = admin._id;

    await lesson.save();

    section.totalDuration = Number(
      (section.totalDuration + lesson.duration).toFixed(2),
    );
    await section.save();

    course.totalDuration = Number(
      (course.totalDuration + lesson.duration).toFixed(2),
    );
    await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Video uploaded successfully",
        lesson,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    handleApiError(error);
  }
}

export async function DELETE(
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

    const admin = await getCurrentAdmin(req);

    if (admin?.role !== AdminRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 403,
        },
      );
    }

    const { id } = await params;

    const lesson = await Lesson.findById(id);

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

    // Section
    const section = await Section.findById(lesson.section);

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          message: "Section not found",
        },
        {
          status: 404,
        },
      );
    }

    // Course
    const course = await Course.findById(section.course);

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

    if (lesson.videoStorageKey) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: lesson.videoStorageKey,
          }),
        );
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          {
            success: false,
            message: "Video Delete Failed",
          },
          {
            status: 500,
          },
        );
      }
    }

    section.totalDuration = section.totalDuration - lesson.duration;
    await section.save();
    course.totalDuration = course.totalDuration - lesson.duration;
    await course.save();

    lesson.videoStorageKey = undefined;
    lesson.videoOriginalName = undefined;
    lesson.videoMimeType = undefined;
    lesson.videoSize = undefined;

    // lesson.thumbnailUrl = undefined;

    lesson.duration = 0;
    lesson.status = LessonStatus.DRAFT;

    lesson.uploadedAt = undefined;
    lesson.uploadedBy = undefined;

    lesson.videoStatus = VideoStatus.NOT_UPLOADED;

    lesson.playbackType = PlaybackType.MP4;

    await lesson.save();

    return NextResponse.json(
      {
        success: true,
        message: "Video deleted successfully",
        lesson,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
