import { ApiError } from "@/lib/api-error";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentUser } from "@/middlewares/auth.middleware";
import Course, { CourseStatus } from "@/models/course.model";

import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const { courseId } = await req.json();

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

    const course = await Course.findOne({
      _id: courseId,

      status: CourseStatus.PUBLISHED,

      isPublished: true,
    });

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

    // Free Courses Only
    if (!course.isFree) {
      return NextResponse.json(
        {
          success: false,
          message: "This is a paid course. Please complete payment.",
        },
        {
          status: 400,
        },
      );
    }

    // Already Enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: user._id,
      course: course._id,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already enrolled in this course.",
        },
        {
          status: 409,
        },
      );
    }

    // Create Enrollment
    await Enrollment.create({
      user: user._id,

      course: course._id,

      status: EnrollmentStatus.ACTIVE,
    });

    // Increment Counter
    await Course.findByIdAndUpdate(course._id, {
      $inc: {
        enrollmentCount: 1,
      },
    });

    return NextResponse.json(
      {
        success: true,

        message: "Enrolled successfully.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
