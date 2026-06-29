import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Course from "@/models/course.model";
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

    const {
      title,
      description,
      videoPublicId,
      duration,
      isPreview,
      isDownloadable,
    } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson title is required",
        },
        { status: 400 },
      );
    }

    const section = await Section.findById(id);

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          message: "Section not found",
        },
        { status: 404 },
      );
    }

    // Duplicate Check
    const existingLesson = await Lesson.findOne({
      section: section._id,
      title: title.trim(),
    });

    if (existingLesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson already exists",
        },
        { status: 409 },
      );
    }

    // Auto Sort Order
    const lastLesson = await Lesson.findOne({
      section: section._id,
    })
      .sort({
        sortOrder: -1,
      })
      .lean();

    const lesson = await Lesson.create({
      title: title.trim(),

      description: description?.trim(),

      section: section._id,
      course: section.course,

      // videoPublicId,

      duration: duration || 0,

      isPreview: isPreview || false,

      isDownloadable: isDownloadable || false,

      status: LessonStatus.DRAFT,

      sortOrder: (lastLesson?.sortOrder || 0) + 1,
    });

    // Update Section Counters
    await Section.findByIdAndUpdate(section._id, {
      $inc: {
        totalLessons: 1,
        totalDuration: duration || 0,
      },
    });

    // Update Course Counters
    await Course.findByIdAndUpdate(section.course, {
      $inc: {
        totalLessons: 1,
        totalDuration: duration || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lesson created successfully",

        lesson,
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { id } = await params;

    const section = await Section.findById(id)
      .populate("course", "title totalLessons totalDuration")
      .lean();

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          message: "Section not found",
        },
        {
          status: 404,
        },
      );
    }

    const lessons = await Lesson.find({
      section: id,
    })
      .sort({
        sortOrder: 1,
      })
      .populate("uploadedBy", "fullName")
      .lean();

    return NextResponse.json(
      {
        success: true,

        section,

        lessons,
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
