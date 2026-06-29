import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Section from "@/models/section.model";
import { NextRequest, NextResponse } from "next/server";
import Course from "@/models/course.model";
import Lesson from "@/models/lesson.model";
import { handleApiError } from "@/lib/handle-api-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);
    const { id } = await params;
    const { title, sortOrder } = await req.json();
    const section = await Section.findById(id);

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

    if (title && title?.trim()) {
      const existingSection = await Section.findOne({
        course: section.course,
        title: title.trim(),
        _id: {
          $ne: section._id,
        },
      });

      if (existingSection) {
        return NextResponse.json(
          {
            success: false,
            message: "Section title already exists",
          },
          {
            status: 409,
          },
        );
      }

      section.title = title.trim();
    }

    if (sortOrder !== undefined && sortOrder > 0) {
      section.sortOrder = sortOrder;
    }

    console.log("section : ", section._id);
    console.log("Sorting : ", sortOrder);

    await section.save();

    return NextResponse.json(
      {
        success: true,
        message: "Section updated successfully",
        section,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { id } = await params;

    const section = await Section.findById(id);

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
      section: section._id,
    }).select("duration");

    const totalLessons = lessons.length;

    const totalDuration = lessons.reduce(
      (sum, lesson) => sum + lesson.duration,
      0,
    );

    // Delete Lessons
    await Lesson.deleteMany({
      section: section._id,
    });

    // Update Course Counters
    await Course.findByIdAndUpdate(section.course, {
      $inc: {
        totalSections: -1,
        totalLessons: -totalLessons,
        totalDuration: -totalDuration,
      },
    });

    // Delete Section
    await section.deleteOne();

    return NextResponse.json(
      {
        success: true,
        message: "Section deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}
