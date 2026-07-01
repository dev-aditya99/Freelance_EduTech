import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Enrollment from "@/models/enrollment.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10"), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");

    const filter: any = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }
    if (courseId && courseId !== "ALL") {
      filter.course = courseId;
    }

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .populate("user", "fullName email profileImage username")
        .populate("course", "title thumbnail")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        enrollments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
