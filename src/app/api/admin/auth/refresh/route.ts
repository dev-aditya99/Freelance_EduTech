import connectDB from "@/lib/db";

import {
  generateAccessTokenAdmin,
  generateRefreshTokenAdmin,
  verifyRefreshToken,
} from "@/lib/jwt";

import Admin from "@/models/admin.model";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const refreshToken = req.cookies.get("admin_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token missing",
        },
        {
          status: 401,
        },
      );
    }

    const decoded = verifyRefreshToken(refreshToken) as {
      _id: string;
      sessionId: string;
    };

    const admin = await Admin.findById(decoded._id).select(
      "+refreshToken +activeSessionId",
    );

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

    // Refresh Token Match
    if (admin.refreshToken !== refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session",
        },
        {
          status: 401,
        },
      );
    }

    // Session Match
    if (admin.activeSessionId !== decoded.sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken = generateAccessTokenAdmin({
      _id: admin._id.toString(),
      role: admin.role,
      sessionId: admin.activeSessionId!,
    });

    const newRefreshToken = generateRefreshTokenAdmin({
      _id: admin._id.toString(),
      sessionId: admin.activeSessionId!,
    });

    admin.refreshToken = newRefreshToken;

    await admin.save();

    const response = NextResponse.json(
      {
        success: true,
        accessToken,
      },
      {
        status: 200,
      },
    );

    response.cookies.set({
      name: "admin_refresh_token",

      value: newRefreshToken,

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired refresh token",
      },
      {
        status: 401,
      },
    );
  }
}
