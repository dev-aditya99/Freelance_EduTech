import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Course from "@/models/course.model";
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
    const { title } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Section title is required",
        },
        { status: 400 },
      );
    }

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 },
      );
    }

    const existingSection = await Section.findOne({
      course: id,
      title: title.trim(),
    });

    if (existingSection) {
      return NextResponse.json(
        {
          success: false,
          message: "Section already exists",
        },
        { status: 409 },
      );
    }

    // Auto Sort Order
    const lastSection = await Section.findOne({
      course: id,
    })
      .sort({ sortOrder: -1 })
      .lean();

    const section = await Section.create({
      title: title.trim(),
      course: id,
      sortOrder: (lastSection?.sortOrder || 0) + 1,
    });

    // Update Course Counter
    course.totalSections += 1;

    await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Section created successfully",
        section,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 },
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

    // Validate Course
    const course = await Course.findById(id)
      .select("title totalSections totalLessons totalDuration")
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

    const sections = await Section.find({
      course: id,
    })
      .sort({
        sortOrder: 1,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,

        course,

        sections,
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
