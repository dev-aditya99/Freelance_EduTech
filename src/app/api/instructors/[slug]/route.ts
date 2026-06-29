import connectDB from "@/lib/db";

import Instructor from "@/models/instructor.model";
import Course, { CourseStatus } from "@/models/course.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  },
) {
  try {
    await connectDB();

    const { slug } = await params;

    const instructor = await Instructor.findOne({
      slug,
      isActive: true,
    }).lean();

    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Instructor not found",
        },
        {
          status: 404,
        },
      );
    }

    const courses = await Course.find({
      instructor: instructor._id,
      isPublished: true,
      status: CourseStatus.PUBLISHED,
    })
      .select(
        `
            title
            slug
            thumbnail

            averageRating
            enrollmentCount
            
            totalLessons
            totalDuration
                `,
      )
      .sort({
        enrollmentCount: -1,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        instructor,

        stats: {
          totalCourses: courses.length,
        },
        courses,
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
