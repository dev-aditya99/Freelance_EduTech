import connectDB from "@/lib/db";
import { getCurrentUser } from "@/middlewares/auth.middleware";

import Enrollment, {
    EnrollmentStatus,
} from "@/models/enrollment.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const user = await getCurrentUser(req);

        const enrollments =
            await Enrollment.find({
                user: user._id,
                status: EnrollmentStatus.ACTIVE,
            })
                .populate({
                    path: "course",

                    select: `
                        title
                        slug
                        thumbnail
                        shortDescription

                        isFree
                        price
                        discountPrice

                        totalLessons
                        totalDuration

                        averageRating
                        enrollmentCount

                        category
                    `,

                    populate: {
                        path: "category",
                        select: "name slug",
                    },
                })
                .sort({
                    createdAt: -1,
                })
                .lean();

        const courses = enrollments
            .filter(
                (item) => item.course
            )
            .map((item) => ({
                enrollmentId: item._id,
                enrolledAt: item.createdAt,
                course: item.course,
                progressPercentage: item.progressPercentage,
                completedLessons: item.completedLessons,
                certificateIssued: item.certificateIssued,
                lastAccessedLesson: item.lastAccessedLesson,
                lastAccessedAt: item.lastAccessedAt,
                completedAt: item.completedAt,
            }));

        return NextResponse.json(
            {
                success: true,
                total: courses.length,
                courses,
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