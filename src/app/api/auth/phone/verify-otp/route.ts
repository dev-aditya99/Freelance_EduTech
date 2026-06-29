import connectDB from "@/lib/db";
import Otp from "@/models/otp.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User, { UserRole } from "@/models/user.model";

import {
    generateAccessToken,
    generateRefreshToken,
} from "@/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { phone, otp } = await req.json();

        // Validatation 
        if (!phone || !otp) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Phone number and OTP are required",
                },
                {
                    status: 400,
                }
            );
        }

        const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

        if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid phone number",
                },
                {
                    status: 400,
                }
            );
        }

        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid OTP format",
                },
                {
                    status: 400,
                }
            );
        }

        // Find OTP
        const otpDoc = await Otp.findOne({
            phone: normalizedPhone,
        });

        if (!otpDoc) {
            return NextResponse.json(
                {
                    success: false,
                    message: "OTP not found or expired",
                },
                {
                    status: 404,
                }
            );
        }

        // Expiry Check
        if (otpDoc.expiresAt < new Date()) {
            await Otp.deleteOne({
                _id: otpDoc._id,
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "OTP has expired",
                },
                {
                    status: 400,
                }
            );
        }

        // Attempts Check
        if (otpDoc.attempts >= 5) {
            await Otp.deleteOne({
                _id: otpDoc._id,
            });

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Maximum verification attempts exceeded. Please request a new OTP.",
                },
                {
                    status: 429,
                }
            );
        }

        // Verify OTP
        const isOtpValid = await bcrypt.compare(
            otp,
            otpDoc.otp
        );

        if (!isOtpValid) {
            otpDoc.attempts += 1;
            await otpDoc.save();

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid OTP",
                    remainingAttempts: 5 - otpDoc.attempts,
                },
                {
                    status: 400,
                }
            );
        }

        let user = await User.findOne({
            mobile: normalizedPhone,
        });

        let isNewUser = false;

        if (!user) {
            user = await User.create({
                username: `User${normalizedPhone}`,
                mobile: normalizedPhone,
                role: UserRole.USER,
                isMobileVerified: true,
                onboardingCompleted: false,
            });

            isNewUser = true;
        } else {
            if (!user.isMobileVerified) {
                user.isMobileVerified = true;
                await user.save();
            }
        }

        const accessToken = generateAccessToken({
            _id: user._id.toString(),
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            _id: user._id.toString(),
        });

        user.refreshToken = refreshToken;
        await user.save();

        await Otp.deleteOne({
            _id: otpDoc._id,
        });

        return NextResponse.json(
            {
                success: true,
                message: isNewUser
                    ? "Account created successfully"
                    : "Login successful",

                isNewUser,

                user: {
                    _id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    mobile: user.mobile,
                    role: user.role,
                    onboardingCompleted:
                        user.onboardingCompleted,
                },
                accessToken,
                refreshToken,
            },
            {
                status: 200,
            }
        )

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}