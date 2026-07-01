import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Lesson from "@/models/lesson.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search");
    const courseId = searchParams.get("courseId");
    const sectionId = searchParams.get("sectionId");
    const status = searchParams.get("status");

    // Sirf wo lessons jisme videoStatus "NOT_UPLOADED" nahi hai
    const query: any = { videoStatus: { $ne: "NOT_UPLOADED" } };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (courseId) query.course = courseId;
    if (sectionId) query.section = sectionId;
    if (status) query.videoStatus = status;

    const skip = (page - 1) * limit;

    // Fetch Total Count for Pagination
    const totalVideos = await Lesson.countDocuments(query);

    // Fetch Paginated Data
    const lessons = await Lesson.find(query)
      .populate("section", "title sortOrder")
      .populate("course", "title slug category")
      .sort({ uploadedAt: -1, createdAt: -1 }) // Newest uploads first
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: lessons,
        pagination: {
          total: totalVideos,
          page,
          limit,
          totalPages: Math.ceil(totalVideos / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch Videos Error:", error);
    return handleApiError(error);
  }
}
