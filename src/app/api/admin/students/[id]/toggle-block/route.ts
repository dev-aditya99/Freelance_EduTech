import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;
    const { isBlocked } = await req.json();

    const student = await User.findById(id);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    student.isBlocked = isBlocked;
    await student.save();

    return NextResponse.json(
      {
        success: true,
        message: `User successfully ${isBlocked ? "blocked" : "unblocked"}`,
        student,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
