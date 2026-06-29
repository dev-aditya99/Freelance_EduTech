import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentUser } from "@/middlewares/auth.middleware";
import Wishlist from "@/models/wishlist.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
    }>;
  },
) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const { courseId } = await params;

    const exists = await Wishlist.findOne({
      user: user._id,
      course: courseId,
    });

    return NextResponse.json(
      {
        success: true,
        isWishlisted: !!exists,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
