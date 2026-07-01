import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Enrollment from "@/models/enrollment.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;
    const { status } = await req.json();

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "Enrollment not found" },
        { status: 404 },
      );
    }

    enrollment.status = status;
    await enrollment.save();

    return NextResponse.json(
      {
        success: true,
        message: `Enrollment status updated to ${status}`,
        enrollment,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
