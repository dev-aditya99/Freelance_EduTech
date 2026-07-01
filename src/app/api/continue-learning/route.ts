import { ApiError } from "@/lib/api-error";
import connectDB from "@/lib/db";
import { getCurrentUser } from "@/middlewares/auth.middleware";

import Progress from "@/models/progress.model";
import mongoose from "mongoose";
import "@/models/course.model";
import "@/models/lesson.model";

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/handle-api-error";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const latestProgress = await Progress.findOne({
      user: user._id,
    })
      .populate({
        path: "course",
        select: `
                        title
                        slug
                        thumbnail
                    `,
      })
      .populate({
        path: "lesson",
        select: `
                        title
                        duration
                        lessonOrder
                    `,
      })
      .sort({
        updatedAt: -1,
      })
      .lean();

    if (!latestProgress) {
      return NextResponse.json(
        {
          success: true,
          hasContinueLearning: false,
          data: null,
        },
        {
          status: 200,
        },
      );
    }

    const lesson = latestProgress.lesson as any;

    const progressPercentage = lesson?.duration
      ? Math.min(
          100,
          Math.round((latestProgress.watchedDuration / lesson.duration) * 100),
        )
      : 0;

    return NextResponse.json(
      {
        success: true,

        hasContinueLearning: true,

        data: {
          course: latestProgress.course,

          lesson: latestProgress.lesson,

          lastWatchedPosition: latestProgress.lastWatchedPosition,

          watchedDuration: latestProgress.watchedDuration,

          progressPercentage,

          isCompleted: latestProgress.isCompleted,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
