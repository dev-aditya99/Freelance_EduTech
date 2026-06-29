import connectDB from "@/lib/db";
import User from "@/models/user.model";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { refreshToken } = await req.json();

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Refresh token is required",
                },
                {
                    status: 401,
                }
            );
        }

        // Verify Token
        const decoded = verifyRefreshToken(
            refreshToken
        ) as {
            _id: string;
            iat: number;
            exp: number;
        };

        // Find User
        const user = await User.findById(decoded._id);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404,
                }
            );
        }

        if (user.refreshToken !== refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid session",
                },
                {
                    status: 401,
                }
            );
        }

        if (user.isBlocked) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Your account has been blocked",
                },
                {
                    status: 403,
                }
            );
        }

        // Generate New Tokens
        const newAccessToken =
            generateAccessToken({
                _id: user._id.toString(),
                role: user.role,
            });

        const newRefreshToken =
            generateRefreshToken({
                _id: user._id.toString(),
            });

        user.refreshToken = newRefreshToken;
        await user.save();


        return NextResponse.json(
            {
                success: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Invalid or expired refresh token",
            },
            {
                status: 401,
            }
        );
    }
}