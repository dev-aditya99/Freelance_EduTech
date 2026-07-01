import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import User, { UserRole } from "@/models/user.model";
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

    const search = searchParams.get("search")?.trim() || "";
    const isBlocked = searchParams.get("isBlocked");
    const identity = searchParams.get("identity");

    const filter: any = { role: UserRole.USER };

    // Search by Name, Email, or Mobile
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by Block Status
    if (isBlocked === "true") filter.isBlocked = true;
    if (isBlocked === "false") filter.isBlocked = false;

    // Filter by Identity
    if (identity && identity !== "ALL") {
      filter.identity = identity;
    }

    const [students, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        students,
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
