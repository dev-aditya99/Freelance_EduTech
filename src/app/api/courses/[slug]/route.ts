import connectDB from "@/lib/db";
import "@/models/category.model";
import "@/models/instructor.model";
import Course, { CourseStatus } from "@/models/course.model";
import Lesson, { LessonStatus } from "@/models/lesson.model";
import Section from "@/models/section.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();

    const { slug } = await params;

    const course = await Course.findOne({
      slug,
      status: CourseStatus.PUBLISHED,
      isPublished: true,
    })
      .select(
        `
            title
            slug
            thumbnail

            shortDescription
            description

            whatYouWillLearn
            requirements
            targetAudience

            instructor
            level
            language

            isFree
            price
            discountPrice

            totalSections
            totalLessons
            totalDuration

            enrollmentCount
            averageRating
            totalRatings

            category
        `,
      )
      .populate("category", "name slug")
      .populate(
        "instructor",
        `fullName
        slug
        bio
        profileImage
        designation
        headline
        totalStudents
        totalCourses
        `,
      )
      .lean();

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

    // Fetch Sections
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

    // Fetch Preview Lessons
    const previewLessons = await Lesson.find({
      course: course._id,
      status: LessonStatus.PUBLISHED,
      isPreview: true,
    })
      .select(
        `
                    title
                    duration
                    sortOrder
                    section
                `,
      )
      .sort({
        sortOrder: 1,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        course,
        sections,
        previewLessons,
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
