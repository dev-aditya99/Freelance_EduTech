import crypto from "crypto";

import connectDB from "@/lib/db";
import { getCurrentUser } from "@/middlewares/auth.middleware";

import Course from "@/models/course.model";
import Enrollment, {
    EnrollmentStatus,
} from "@/models/enrollment.model";

import Payment, {
    PaymentStatus,
} from "@/models/payment.model";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const user = await getCurrentUser(req);

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = await req.json();

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Payment details are required",
                },
                {
                    status: 400,
                }
            );
        }

        // Find Payment
        const payment =
            await Payment.findOne({
                razorpayOrderId:
                    razorpay_order_id,
                user: user._id,
            });

        if (!payment) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Payment not found",
                },
                {
                    status: 404,
                }
            );
        }

        // Already Verified
        if (
            payment.status ===
            PaymentStatus.SUCCESS
        ) {
            return NextResponse.json(
                {
                    success: true,
                    message:
                        "Payment already verified",
                },
                {
                    status: 200,
                }
            );
        }

        // Signature Verification
        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env
                        .RAZORPAY_KEY_SECRET!
                )
                .update(body)
                .digest("hex");

        if (
            expectedSignature !==
            razorpay_signature
        ) {
            payment.status =
                PaymentStatus.FAILED;

            await payment.save();

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid payment signature",
                },
                {
                    status: 400,
                }
            );
        }

        // Update Payment
        payment.status =
            PaymentStatus.SUCCESS;

        payment.razorpayPaymentId =
            razorpay_payment_id;

        payment.razorpaySignature =
            razorpay_signature;

        await payment.save();

        // Enrollment Check
        const existingEnrollment =
            await Enrollment.findOne({
                user: user._id,
                course: payment.course,
            });

        if (!existingEnrollment) {
            await Enrollment.create({
                user: user._id,

                course:
                    payment.course,

                status:
                    EnrollmentStatus.ACTIVE,
            });

            await Course.findByIdAndUpdate(
                payment.course,
                {
                    $inc: {
                        enrollmentCount: 1,
                    },
                }
            );
        }

        return NextResponse.json(
            {
                success: true,

                message:
                    "Payment verified successfully",

                courseUnlocked: true,
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
                message:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}