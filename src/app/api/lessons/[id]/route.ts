import connectDB from "@/lib/db";

import { getCurrentUser } from "@/middlewares/auth.middleware";
import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";
import Lesson, { LessonStatus } from "@/models/lesson.model";
import Progress from "@/models/progress.model";
import Section from "@/models/section.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;
    const lesson = await Lesson.findOne({
      _id: id,

      status: LessonStatus.PUBLISHED,
    })
      .populate("section", "title sortOrder")
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

    const sections = await Section.find({
      course: lesson.course,
    })
      .select(
        `
    _id
    sortOrder
  `,
      )
      .sort({
        sortOrder: 1,
      })
      .lean();

    const allLessons = await Lesson.find({
      course: lesson.course,
      status: LessonStatus.PUBLISHED,
    })
      .select(
        `
    _id
    title
    section
    sortOrder
  `,
      )
      .lean();

    const orderedLessons = sections.flatMap((section) =>
      allLessons
        .filter(
          (lessonItem) =>
            lessonItem.section.toString() === section._id.toString(),
        )
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );

    const currentIndex = orderedLessons.findIndex(
      (lessonItem) => lessonItem._id.toString() === lesson._id.toString(),
    );

    const previousLesson =
      currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;

    const nextLesson =
      currentIndex < orderedLessons.length - 1
        ? orderedLessons[currentIndex + 1]
        : null;

    /*
     * Preview Lessons
     * Public Access
     */
    if (lesson.isPreview) {
      return NextResponse.json(
        {
          success: true,
          lesson,
          progress: null,
          previousLesson,
          nextLesson,
          hasAccess: true,
        },
        {
          status: 200,
        },
      );
    }

    /*
     * Paid/Protected Lessons
     */

    let user;

    try {
      user = await getCurrentUser(req);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        {
          status: 401,
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
          hasAccess: false,
        },
        {
          status: 403,
        },
      );
    }

    const progress = await Progress.findOne({
      user: user._id,
      course: lesson.course,
      lesson: lesson._id,
    }).lean();

    return NextResponse.json(
      {
        success: true,
        lesson,
        progress,
        previousLesson,
        nextLesson,
        enrollment: {
          progressPercentage: enrollment.progressPercentage,
          completedLessons: enrollment.completedLessons,
          lastAccessedLesson: enrollment.lastAccessedLesson,
        },
        hasAccess: true,
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
