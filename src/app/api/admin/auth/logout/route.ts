import connectDB from "@/lib/db";
import Admin from "@/models/admin.model";
import { verifyRefreshToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const refreshToken = req.cookies.get("admin_refresh_token")?.value;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken) as {
          _id: string;
          sessionId: string;
        };

        const admin = await Admin.findById(decoded._id).select(
          "+refreshToken +activeSessionId",
        );

        if (admin && admin.refreshToken === refreshToken) {
          admin.refreshToken = undefined;
          admin.activeSessionId = undefined;
          await admin.save();
        }
      } catch {}
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      {
        status: 200,
      },
    );

    response.cookies.set({
      name: "admin_refresh_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(error);

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
