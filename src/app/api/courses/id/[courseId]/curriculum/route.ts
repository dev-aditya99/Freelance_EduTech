import connectDB from "@/lib/db";

import Course from "@/models/course.model";
import Section from "@/models/section.model";

import Lesson, { LessonStatus } from "@/models/lesson.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
    }>;
  },
) {
  try {
    await connectDB();

    const { courseId } = await params;

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

    const sections = await Section.find({
      course: course._id,
    })
      .select(
        `
          title
          sortOrder
          totalLessons
          totalDuration
        `,
      )
      .sort({
        sortOrder: 1,
      })
      .lean();

    const curriculum = await Promise.all(
      sections.map(async (section) => {
        const lessons = await Lesson.find({
          section: section._id,

          status: LessonStatus.PUBLISHED,
        })
          .select(
            `
                  _id
                  title
                  duration
                  isPreview
                  sortOrder
                `,
          )
          .sort({
            sortOrder: 1,
          })
          .lean();

        return {
          ...section,
          lessons,
        };
      }),
    );

    return NextResponse.json(
      {
        success: true,
        curriculum,
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
