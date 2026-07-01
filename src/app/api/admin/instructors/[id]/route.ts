import { deleteCloudinaryImage } from "@/helpers/delete-cloudinary-image";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Course from "@/models/course.model";
import Instructor from "@/models/instructor.model";
import { NextRequest, NextResponse } from "next/server";

// Get Perticular Instructor
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { id } = await params;

    const instructor = await Instructor.findById(id);

    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Instructor not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        instructor,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}

// Update Perticular Instructor
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;
    const body = await req.json();

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return NextResponse.json(
        { success: false, message: "Instructor not found" },
        { status: 404 },
      );
    }

    // Allowed fields
    const allowedUpdates = [
      "fullName",
      "slug",
      "email",
      "phone",
      "profileImage",
      "profileImagePublicId",
      "coverImage",
      "coverImagePublicId",
      "designation",
      "headline",
      "bio",
      "experienceYears",
      "totalStudents",
      "totalCourses",
      "linkedinUrl",
      "youtubeUrl",
      "websiteUrl",
      "isActive",
    ];

    // Individual updates
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        // Extra validations
        if (key === "email") {
          if (!body[key]) {
            return NextResponse.json(
              { success: false, message: "Email is required" },
              { status: 404 },
            );
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body[key])) {
            return NextResponse.json(
              { success: false, message: "Invalid email format" },
              { status: 400 },
            );
          }
        }
        if (key === "phone") {
          if (!body[key]) {
            return NextResponse.json(
              { success: false, message: "Phone is required" },
              { status: 404 },
            );
          }

          if (!/^\+?[0-9]{7,15}$/.test(body[key])) {
            return NextResponse.json(
              { success: false, message: "Invalid phone number format" },
              { status: 400 },
            );
          }
        }

        if (key === "profileImage") {
          if (!body[key]) {
            return NextResponse.json(
              { success: false, message: "Profile Image is required" },
              { status: 404 },
            );
          }
        }

        if (key === "slug") {
          body[key] = body[key].trim().toLowerCase();
        }

        // Assign field individually
        (instructor as any)[key] = body[key];
      }
    }

    await instructor.save(); // Save after all updates

    return NextResponse.json({ success: true, instructor }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update Perticular Instructor
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { id } = await params;

    const instructor = await Instructor.findById(id);

    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Instructor not found",
        },
        {
          status: 404,
        },
      );
    }

    const count = await Course.countDocuments({
      instructor: id,
    });

    if (count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `This instructor is associated with ${count} courses. Please reassign or remove those courses before deleting the instructor.`,
        },
        {
          status: 400,
        },
      );
    }

    if (
      instructor.profileImagePublicId &&
      instructor.profileImagePublicId != undefined
    ) {
      const isDeleted = await deleteCloudinaryImage(
        instructor.profileImagePublicId,
      );

      if (!isDeleted) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to delete Instructor because unable to delete profile image",
          },
          { status: 400 },
        );
      }

      instructor.profileImage = undefined;
      instructor.profileImagePublicId = undefined;
    }

    if (
      instructor.coverImagePublicId &&
      instructor.coverImagePublicId != undefined
    ) {
      const isDeleted = await deleteCloudinaryImage(
        instructor.coverImagePublicId,
      );

      if (!isDeleted) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to delete Instructor because unable to delete cover image",
          },
          { status: 400 },
        );
      }

      instructor.coverImage = undefined;
      instructor.coverImagePublicId = undefined;
    }

    await instructor.save();

    await Instructor.deleteOne({ _id: id });

    return NextResponse.json(
      {
        success: true,
        message: `Instructor deleted successfully`,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
