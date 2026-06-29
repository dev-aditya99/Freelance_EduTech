import connectDB from "@/lib/db";
import { getCurrentUser } from "@/middlewares/auth.middleware";

import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";

import Lesson, { LessonStatus } from "@/models/lesson.model";

import Progress from "@/models/progress.model";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const { courseId, lessonId, lastWatchedPosition, watchedDuration } =
      await req.json();

    if (!courseId || !lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID and Lesson ID are required",
        },
        {
          status: 400,
        },
      );
    }

    const enrollment = await Enrollment.findOne({
      user: user._id,
      course: courseId,
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

    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: courseId,
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

    const progress = await Progress.findOneAndUpdate(
      {
        user: user._id,
        course: courseId,
        lesson: lessonId,
      },
      {
        $set: {
          lastWatchedPosition,
          watchedDuration,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    enrollment.lastAccessedLesson = lesson._id;
    enrollment.lastAccessedAt = new Date();

    await enrollment.save();

    return NextResponse.json(
      {
        success: true,
        message: "Progress updated",
        progress,
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
