import connectDB from "@/lib/db";

import { getCurrentUser } from "@/middlewares/auth.middleware";

import Lesson, { LessonStatus } from "@/models/lesson.model";

import Progress from "@/models/progress.model";

import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";

import Course from "@/models/course.model";

import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

    const course = await Course.findById(lesson.course);

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

    let progress = await Progress.findOne({
      user: user._id,
      course: lesson.course,
      lesson: lesson._id,
    });

    if (!progress) {
      progress = await Progress.create({
        user: user._id,
        course: lesson.course,
        lesson: lesson._id,
        isCompleted: true,
        completedAt: new Date(),
      });
    } else if (!progress.isCompleted) {
      progress.isCompleted = true;

      progress.completedAt = new Date();

      await progress.save();
    }

    const completedLessons = await Progress.countDocuments({
      user: user._id,
      course: lesson.course,
      isCompleted: true,
    });

    const progressPercentage = Math.round(
      (completedLessons / course.totalLessons) * 100,
    );

    enrollment.completedLessons = completedLessons;

    enrollment.progressPercentage = progressPercentage;

    enrollment.lastAccessedLesson = lesson._id;

    enrollment.lastAccessedAt = new Date();

    if (progressPercentage >= 100) {
      enrollment.completedAt = new Date();

      enrollment.certificateIssued = true;
    }

    await enrollment.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lesson completed",
        completedLessons,
        progressPercentage,
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
