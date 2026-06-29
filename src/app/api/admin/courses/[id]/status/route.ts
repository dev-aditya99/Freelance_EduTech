import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Course, { CourseStatus } from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);
    const { id } = await params;

    if (!id) {
      NextResponse.json(
        {
          success: false,
          message: "Course id is requried",
        },
        {
          status: 404,
        },
      );
    }

    const { status } = await req.json();

    if (!status || status == "") {
      NextResponse.json(
        {
          success: false,
          message: "Status can't be empty",
        },
        {
          status: 404,
        },
      );
    }

    const course = await Course.findById(id);

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
    course.status = status;
    await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Course Status Changed!",
        status: course.status,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}
