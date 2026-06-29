import connectDB from "@/lib/db";
import Admin from "@/models/admin.model";

import { generateAccessTokenAdmin, generateRefreshTokenAdmin } from "@/lib/jwt";

import bcrypt from "bcryptjs";
import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        {
          status: 400,
        },
      );
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password +refreshToken +activeSessionId");

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        {
          status: 401,
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

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        {
          status: 401,
        },
      );
    }

    const sessionId = crypto.randomUUID();
    admin.activeSessionId = sessionId;

    const accessToken = generateAccessTokenAdmin({
      _id: admin._id.toString(),
      role: admin.role,
      sessionId,
    });

    const refreshToken = generateRefreshTokenAdmin({
      _id: admin._id.toString(),

      sessionId,
    });

    admin.refreshToken = refreshToken;
    admin.lastLoginAt = new Date();

    await admin.save();

    const response = NextResponse.json(
      {
        success: true,
        accessToken,

        admin: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          profileImage: admin.profileImage,
        },
      },
      {
        status: 200,
      },
    );

    response.cookies.set({
      name: "admin_refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
