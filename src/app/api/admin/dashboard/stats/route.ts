import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    return NextResponse.json(
      {
        success: true,
        message: "Found Stats",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
