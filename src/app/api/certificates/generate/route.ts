import connectDB from "@/lib/db";

import { getCurrentUser } from "@/middlewares/auth.middleware";

import Certificate from "@/models/certificate.model";
import Course from "@/models/course.model";

import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";

import Lesson, { LessonStatus } from "@/models/lesson.model";

import Progress from "@/models/progress.model";

import { NextRequest, NextResponse } from "next/server";

import { uploadCertificate } from "@/lib/upload-certificate";
import { generateCertificateBuffer } from "@/lib/generate-certificate";

function generateCertificateNumber() {
  return "EDT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const { courseId } = await req.json();

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

    const existingCertificate = await Certificate.findOne({
      user: user._id,
      course: courseId,
    });

    if (existingCertificate && existingCertificate.pdfStorageKey) {
      return NextResponse.json(
        {
          success: true,
          message: "Certificate already generated",
          certificate: existingCertificate,
        },
        {
          status: 200,
        },
      );
    }

    const totalLessons = await Lesson.countDocuments({
      course: courseId,

      status: LessonStatus.PUBLISHED,
    });

    const completedLessons = await Progress.countDocuments({
      user: user._id,

      course: courseId,

      isCompleted: true,
    });

    const progressPercentage =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    if (progressPercentage < 100) {
      return NextResponse.json(
        {
          success: false,

          message: "Course is not completed yet",

          progressPercentage,
        },
        {
          status: 400,
        },
      );
    }

    if (!user.fullName || user.fullName.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please complete your profile before generating certificate.",
        },
        {
          status: 400,
        },
      );
    }
    const certificateNumber = generateCertificateNumber();

    const pdfBuffer = await generateCertificateBuffer(
      user.fullname,
      course.title,
      certificateNumber,
    );

    const storageKey = await uploadCertificate(pdfBuffer, certificateNumber);

    const certificate = await Certificate.create({
      user: user._id,
      studentName: user.fullName,
      course: courseId,
      enrollment: enrollment._id,
      certificateNumber,
      pdfStorageKey: storageKey,
    });

    await certificate.save();

    return NextResponse.json(
      {
        success: true,

        message: "Certificate generated successfully",

        certificate,
      },
      {
        status: 201,
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
