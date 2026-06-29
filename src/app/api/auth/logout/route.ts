import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { verifyAccessToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/middlewares/auth.middleware";

export async function POST(req: NextRequest) {
    try {
        // Get User
        const user = await getCurrentUser(req);

        // Logout
        user.refreshToken = undefined;

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Logged out successfully",
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }
}