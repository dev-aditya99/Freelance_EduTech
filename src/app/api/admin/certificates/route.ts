import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Certificate from "@/models/certificate.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "12"), 1),
      100,
    );
    const skip = (page - 1) * limit;
    const search = searchParams.get("search")?.trim() || "";

    const filter: any = {};
    if (search) {
      filter.$or = [
        { certificateNumber: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
      ];
    }

    const [certificates, total] = await Promise.all([
      Certificate.find(filter)
        .populate("user", "email profileImage")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Certificate.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        certificates,
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
