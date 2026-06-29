import connectDB from "@/lib/db";
import Admin from "@/models/admin.model";
import { verifyAccessToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken || accessToken === "undefined" || accessToken === "null") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        {
          status: 401,
        },
      );
    }

    const decoded = verifyAccessToken(accessToken) as {
      _id: string;
      role: string;
      sessionId: string;
    };

    const admin = await Admin.findById(decoded._id).select("+activeSessionId");

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        {
          status: 404,
        },
      );
    }

    if (admin.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          message: "Account is blocked",
        },
        {
          status: 403,
        },
      );
    }

    // Single Device Login Check

    if (admin.activeSessionId && admin.activeSessionId !== decoded.sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Session terminated by another login",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        admin: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          profileImage: admin.profileImage,
          lastLoginAt: admin.lastLoginAt,
          createdAt: admin.createdAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired access token",
      },
      {
        status: 401,
      },
    );
  }
}
