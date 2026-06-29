import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Course, { CourseStatus } from "@/models/course.model";
import Lesson, { LessonStatus } from "@/models/lesson.model";
import Section from "@/models/section.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;
    const course = await Course.findById(id);

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

    if (course.status === CourseStatus.ARCHIVED) {
      return NextResponse.json(
        {
          success: false,
          message: "Archived courses cannot be published",
        },
        {
          status: 400,
        },
      );
    }

    // Minimum 1 Section
    const sectionsCount = await Section.countDocuments({
      course: course._id,
    });

    if (sectionsCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Add at least one section before publishing",
        },
        {
          status: 400,
        },
      );
    }

    // Minimum 1 Published Lesson
    const publishedLessons = await Lesson.countDocuments({
      course: course._id,
      status: LessonStatus.PUBLISHED,
    });
    console.log(publishedLessons);

    if (publishedLessons === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Add and publish at least one lesson before publishing the course",
        },
        {
          status: 400,
        },
      );
    }

    course.status = CourseStatus.PUBLISHED;
    course.isPublished = true;

    await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Course published successfully",

        course,
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
