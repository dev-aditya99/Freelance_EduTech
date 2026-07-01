import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import r2 from "@/lib/r2";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import { AdminRole } from "@/models/admin.model";
import Lesson, { ResourceType } from "@/models/lesson.model";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

// Store Resource Data In Database
export async function PATCH(
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

    const admin = await getCurrentAdmin(req);

    if (admin?.role !== AdminRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await params;

    const {
      title,
      storageKey,
      type,
      originalName,
      mimeType,
      size,
      uploadedAt,
    } = await req.json();

    if (!title || !storageKey || !type || !originalName || !mimeType || !size) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        {
          status: 400,
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

    lesson.resources.push({
      title,
      storageKey,
      type: type as ResourceType,
      originalName,
      mimeType,
      size,
      uploadedAt,
    });

    await lesson.save();

    return NextResponse.json(
      {
        success: true,
        message: "Resource added successfully",
        resources: lesson.resources,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}

// Delete Resource
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
    const admin = await getCurrentAdmin(req);

    if (admin?.role !== AdminRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // Lesson Id
    const { id } = await params;

    // queries
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource Id is required",
        },
        {
          status: 400,
        },
      );
    }

    let lesson = await Lesson.findOne({
      _id: id,
      "resources._id": resourceId,
    });

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource not found in this lesson",
        },
        {
          status: 404,
        },
      );
    }

    // Delete Resource File From R2
    const resource = lesson.resources.find(
      (item) => item._id?.toString() == resourceId,
    );

    if (resource) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: resource?.storageKey,
          }),
        );

        lesson = await Lesson.findByIdAndUpdate(
          id,
          { $pull: { resources: { _id: resourceId } } },
          { new: true },
        );
      } catch (error) {
        NextResponse.json(
          {
            success: false,
            message: "Unable to delete resource file",
          },
          {
            status: 400,
          },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Resource deleted successfully",
        resources: lesson?.resources || [],
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
