import { deleteCloudinaryImage } from "@/helpers/delete-cloudinary-image";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Lesson from "@/models/lesson.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;

    const { thumbnailUrl, thumbnailPublicId } = await req.json();

    if (!thumbnailUrl || !thumbnailPublicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Thumbnail and thumbnail public id are required",
        },
        {
          status: 404,
        },
      );
    }

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson not found",
        },
        {
          status: 404,
        },
      );
    }

    lesson.thumbnailUrl = thumbnailUrl;
    lesson.thumbnailPublicId = thumbnailPublicId;

    await lesson.save();

    return NextResponse.json(
      {
        success: true,
        message: "Thumbnail URL and Public Id stored successfully",
        thumbnailUrl: lesson.thumbnailUrl,
        thumbnailPublicId: lesson.thumbnailPublicId,
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

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson not found",
        },
        {
          status: 404,
        },
      );
    }

    if (lesson.thumbnailPublicId !== thumbnailPublicId) {
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

    lesson.thumbnailUrl = undefined;
    lesson.thumbnailPublicId = undefined;

    await lesson.save();

    return NextResponse.json(
      {
        success: true,
        message: "Thumbnail deleted successfully",
        lesson,
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
