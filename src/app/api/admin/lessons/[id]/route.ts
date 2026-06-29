import { deleteCloudinaryImage } from "@/helpers/delete-cloudinary-image";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import r2 from "@/lib/r2";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Course from "@/models/course.model";
import Lesson, { LessonStatus } from "@/models/lesson.model";
import Section from "@/models/section.model";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);
    const { id } = await params;
    const body = await req.json();
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

    // Duplicate title check
    if (body.title?.trim()) {
      const existingLesson = await Lesson.findOne({
        section: lesson.section,
        title: body.title.trim(),
        _id: { $ne: lesson._id },
      });

      if (existingLesson) {
        return NextResponse.json(
          {
            success: false,
            message: "Lesson title already exists",
          },
          {
            status: 409,
          },
        );
      }

      lesson.title = body.title.trim();
    }

    if (body.description !== undefined) {
      lesson.description = body.description?.trim();
    }

    // if (body.videoPublicId !== undefined) {
    //   lesson.videoPublicId = body.videoPublicId;
    // }

    if (body.isPreview !== undefined) {
      lesson.isPreview = body.isPreview;
    }

    if (body.isDownloadable !== undefined) {
      lesson.isDownloadable = body.isDownloadable;
    }

    if (body.status !== undefined) {
      if (lesson.videoStorageKey) {
        lesson.status = body.status;
      } else {
        lesson.status = LessonStatus.DRAFT;
      }
    }

    if (body.sortOrder !== undefined && body.sortOrder > 0) {
      lesson.sortOrder = body.sortOrder;
    }

    // Duration Difference
    if (body.duration !== undefined && body.duration >= 0) {
      const oldDuration = lesson.duration;
      const newDuration = body.duration;
      const difference = newDuration - oldDuration;

      lesson.duration = newDuration;

      if (difference !== 0) {
        await Promise.all([
          Section.findByIdAndUpdate(lesson.section, {
            $inc: {
              totalDuration: difference,
            },
          }),

          Course.findByIdAndUpdate(lesson.course, {
            $inc: {
              totalDuration: difference,
            },
          }),
        ]);
      }
    }

    await lesson.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lesson updated successfully",
        lesson,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}

// Delete Lesson
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { id } = await params;

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

    const duration = lesson.duration || 0;

    await Promise.all([
      Section.findByIdAndUpdate(lesson.section, {
        $inc: {
          totalLessons: -1,
          totalDuration: -duration,
        },
      }),

      Course.findByIdAndUpdate(lesson.course, {
        $inc: {
          totalLessons: -1,
          totalDuration: -duration,
        },
      }),
    ]);

    // Delete Lesson content first
    // Delete Thumbnail
    if (lesson.thumbnailPublicId) {
      const isDeleted = await deleteCloudinaryImage(lesson.thumbnailPublicId);

      if (!isDeleted) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to delete lesson, because error in deleting thumbnail!",
          },
          {
            status: 500,
          },
        );
      }
    }

    // Delete Lesson Video
    if (lesson.videoStorageKey) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: lesson.videoStorageKey,
          }),
        );
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          {
            success: false,
            message: "Video Delete Failed",
          },
          {
            status: 500,
          },
        );
      }
    }

    // Delete All Resource Files
    const allResources = lesson.resources;

    if (allResources.length > 0) {
      try {
        await Promise.all(
          allResources.map((res) =>
            r2.send(
              new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: res?.storageKey,
              }),
            ),
          ),
        );
      } catch (error) {
        NextResponse.json(
          {
            success: false,
            message: "Unable to delete resource files",
          },
          {
            status: 500,
          },
        );
      }
    }

    // Delete Lesson
    await lesson.deleteOne();

    return NextResponse.json(
      {
        success: true,
        message: "Lesson deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return handleApiError(error);
  }
}
