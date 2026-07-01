import { deleteCloudinaryImage } from "@/helpers/delete-cloudinary-image";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Course from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const thumbnailPublicId = searchParams.get("thumbnailPublicId");

    if (!thumbnailPublicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Thumbnail public id is required",
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

    if (course.thumbnailPublicId !== thumbnailPublicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Thumbnail pubilc id doesn't match",
        },
        {
          status: 404,
        },
      );
    }

    const isDeleted = await deleteCloudinaryImage(thumbnailPublicId);

    if (!isDeleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to delete Thumbnail",
        },
        {
          status: 400,
        },
      );
    }

    course.thumbnail = undefined;
    course.thumbnailPublicId = undefined;

    await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Thumbnail deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return handleApiError(error);
  }
}
