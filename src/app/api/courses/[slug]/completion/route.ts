import connectDB from "@/lib/db";

import { getCurrentUser } from "@/middlewares/auth.middleware";

import Course from "@/models/course.model";

import Enrollment, {
    EnrollmentStatus,
} from "@/models/enrollment.model";

import Lesson, {
    LessonStatus,
} from "@/models/lesson.model";

import Progress from "@/models/progress.model";

import {
    NextRequest,
    NextResponse,
} from "next/server";

export async function GET(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            slug: string;
        }>;
    }
) {
    try {
        await connectDB();

        const user =
            await getCurrentUser(req);

        const { slug } =
            await params;

        // Find Course Using Slug
        const course =
            await Course.findOne({
                slug,
            });

        if (!course) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Course not found",
                },
                {
                    status: 404,
                }
            );
        }

        // Enrollment Check
        const enrollment =
            await Enrollment.findOne({
                user: user._id,

                course: course._id,

                status:
                    EnrollmentStatus.ACTIVE,
            });

        if (!enrollment) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You are not enrolled in this course",
                },
                {
                    status: 403,
                }
            );
        }

        // Total Published Lessons
        const totalLessons =
            await Lesson.countDocuments({
                course: course._id,

                status:
                    LessonStatus.PUBLISHED,
            });

        // Completed Lessons
        const completedLessons =
            await Progress.countDocuments({
                user: user._id,

                course: course._id,

                isCompleted: true,
            });

        const progressPercentage =
            totalLessons === 0
                ? 0
                : Math.round(
                    (completedLessons /
                        totalLessons) *
                    100
                );

        const isCompleted =
            progressPercentage === 100;

        return NextResponse.json(
            {
                success: true,

                courseId:
                    course._id,

                slug:
                    course.slug,

                totalLessons,

                completedLessons,

                progressPercentage,

                isCompleted,
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