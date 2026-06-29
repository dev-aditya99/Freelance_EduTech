import connectDB from "@/lib/db";
import Otp from "@/models/otp.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Phone number is required",
                },
                { status: 400 }
            );
        }

        const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

        if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid phone number",
                },
                { status: 400 }
            );
        }


        // OTP Rate Limit 
        const recentOTP = await Otp.findOne({
            phone: normalizedPhone,
            createdAt: {
                $gte: new Date(Date.now() - 60 * 1000)
            }
        })

        if (recentOTP) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please wait 60 seconds before requesting another OTP."
                },
                {
                    status: 429
                }
            )
        }

        await Otp.deleteMany({ normalizedPhone });


        // Generate OTP 
        const otp = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        console.log(otp)

        const hashedOTP = await bcrypt.hash(otp, 10);

        const OTP = await Otp.create({
            phone: normalizedPhone,
            otp: hashedOTP,
            expiresAt,
        })

        const response: any = {
            success: true,
            message: "OTP sent successfully",
        }

        if (process.env.NODE_ENV === "development") {
            response.otp = otp
        }

        return NextResponse.json(response,
            {
                status: 200
            }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}