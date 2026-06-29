import connectDB from "@/lib/db";
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

    const currentCourse = await Course.findOne({
      slug,
    });

    if (!currentCourse) {
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

    const courses = await Course.find({
      _id: {
        $ne: currentCourse._id,
      },

      category: currentCourse.category,
      status: CourseStatus.PUBLISHED,
      isPublished: true,
    })
      .select(
        `
        title
        slug
        thumbnail
        averageRating
        enrollmentCount
        price
        discountPrice
        category
        level
        language
                `,
      )
      .limit(6)
      .lean();

    return NextResponse.json(
      {
        success: true,
        courses,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
