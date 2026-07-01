import { deleteCloudinaryImage } from "@/helpers/delete-cloudinary-image";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Instructor from "@/models/instructor.model";
import { NextRequest, NextResponse } from "next/server";

// Delete Instructor Profile Image
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const profileImagePublicId = searchParams.get("profileImagePublicId");
    const coverImagePublicId = searchParams.get("coverImagePublicId");

    if (!profileImagePublicId && !coverImagePublicId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Profile image public id and cover image public id are required",
        },
        { status: 400 },
      );
    }

    const instructor = await Instructor.findById(id);

    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Instructor not found",
        },
        { status: 404 },
      );
    }

    if (profileImagePublicId && profileImagePublicId != undefined) {
      if (instructor.profileImagePublicId !== profileImagePublicId) {
        return NextResponse.json(
          {
            success: false,
            message: "Profile image public id doesn't match",
          },
          { status: 400 },
        );
      }

      const isDeleted = await deleteCloudinaryImage(profileImagePublicId);

      if (!isDeleted) {
        return NextResponse.json(
          {
            success: false,
            message: "Unable to delete profile image",
          },
          { status: 400 },
        );
      }

      instructor.profileImage = undefined;
      instructor.profileImagePublicId = undefined;
    }

    if (coverImagePublicId && coverImagePublicId != undefined) {
      if (instructor.coverImagePublicId !== coverImagePublicId) {
        return NextResponse.json(
          {
            success: false,
            message: "Cover image public id doesn't match",
          },
          { status: 400 },
        );
      }

      const isDeleted = await deleteCloudinaryImage(coverImagePublicId);

      if (!isDeleted) {
        return NextResponse.json(
          {
            success: false,
            message: "Unable to delete cover image",
          },
          { status: 400 },
        );
      }

      instructor.coverImage = undefined;
      instructor.coverImagePublicId = undefined;
    }

    await instructor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Image deleted successfully",
        instructor,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return handleApiError(error);
  }
}
