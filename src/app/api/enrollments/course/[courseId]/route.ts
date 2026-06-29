import connectDB from "@/lib/db";

import { getCurrentUser } from "@/middlewares/auth.middleware";

import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";

import Course from "@/models/course.model";

import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { handleApiError } from "@/lib/handle-api-error";

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

    const user = await getCurrentUser(req);

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        {
          status: 400,
        },
      );
    }

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

    const enrollment = await Enrollment.findOne({
      user: user._id,
      course: courseId,
      status: EnrollmentStatus.ACTIVE,
    })
      .populate({
        path: "lastAccessedLesson",
        select: `
                        title
                        slug
                        lessonOrder
                    `,
      })
      .lean();

    if (!enrollment) {
      return NextResponse.json(
        {
          success: true,
          isEnrolled: false,
        },
        {
          status: 200,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        isEnrolled: true,
        enrollment: {
          enrollmentId: enrollment._id,
          enrolledAt: enrollment.createdAt,
          progressPercentage: enrollment.progressPercentage,

          completedLessons: enrollment.completedLessons,
          certificateIssued: enrollment.certificateIssued,
          completedAt: enrollment.completedAt,

          lastAccessedAt: enrollment.lastAccessedAt,
          lastAccessedLesson: enrollment.lastAccessedLesson,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
