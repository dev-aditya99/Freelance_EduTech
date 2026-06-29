import connectDB from "@/lib/db";
import { getCurrentUser } from "@/middlewares/auth.middleware";
import Wishlist from "@/models/wishlist.model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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

    await Wishlist.findOneAndDelete({
      user: user._id,
      course: courseId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Removed from wishlist",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
