import connectDB from "@/lib/db";
import razorpay from "@/lib/payment";
import { getCurrentUser } from "@/middlewares/auth.middleware";
import Course, {
    CourseStatus,
} from "@/models/course.model";
import Enrollment from "@/models/enrollment.model";
import Payment, {
    PaymentStatus,
} from "@/models/payment.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const user = await getCurrentUser(req);

        const { courseId } = await req.json();

        if (!courseId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const course = await Course.findOne({
            _id: courseId,
            status: CourseStatus.PUBLISHED,
            isPublished: true,
        });

        if (!course) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course not found",
                },
                {
                    status: 404,
                }
            );
        }

        if (course.isFree) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Use free enrollment for this course",
                },
                {
                    status: 400,
                }
            );
        }

        // Already Enrolled
        const existingEnrollment =
            await Enrollment.findOne({
                user: user._id,
                course: course._id,
            });

        if (existingEnrollment) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You are already enrolled.",
                },
                {
                    status: 409,
                }
            );
        }

        const amount = course.discountPrice ?? course.price;

        if (amount === undefined || amount === null) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course price is invalid",
                },
                {
                    status: 400,
                }
            );
        }

        // Create Razorpay Order
        const order =
            await razorpay.orders.create({
                amount: amount * 100, // paise
                currency: "INR",

                receipt: `c_${course._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,

                notes: {
                    userId:
                        user._id.toString(),

                    courseId:
                        course._id.toString(),
                },
            });

        // Save Payment Record
        const payment =
            await Payment.create({
                user: user._id,

                course: course._id,

                amount,

                currency: "INR",

                razorpayOrderId:
                    order.id,

                status:
                    PaymentStatus.PENDING,
            });

        return NextResponse.json(
            {
                success: true,

                order: {
                    id: order.id,

                    amount:
                        order.amount,

                    currency:
                        order.currency,
                },

                paymentId:
                    payment._id,

                razorpayKey:
                    process.env
                        .RAZORPAY_KEY_ID,
            },
            {
                status: 201,
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