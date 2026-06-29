import connectDB from "@/lib/db";
import r2 from "@/lib/r2";

import { getCurrentUser } from "@/middlewares/auth.middleware";

import Enrollment, {
    EnrollmentStatus,
} from "@/models/enrollment.model";

import Lesson from "@/models/lesson.model";

import {
    GetObjectCommand,
} from "@aws-sdk/client-s3";

import {
    getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

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
            lessonId: string;
            resourceId: string;
        }>;
    }
) {
    try {
        await connectDB();

        const user =
            await getCurrentUser(req);

        const {
            lessonId,
            resourceId,
        } = await params;

        const lesson =
            await Lesson.findById(
                lessonId
            );

        if (!lesson) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Lesson not found",
                },
                {
                    status: 404,
                }
            );
        }

        const enrollment =
            await Enrollment.findOne({
                user: user._id,

                course:
                    lesson.course,

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

        const resource =
            lesson.resources.find(
                (item) =>
                    item._id?.toString() ===
                    resourceId
            );

        if (!resource) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Resource not found",
                },
                {
                    status: 404,
                }
            );
        }

        const command =
            new GetObjectCommand({
                Bucket:
                    process.env
                        .R2_BUCKET_NAME!,

                Key:
                    resource.storageKey,
            });

        const downloadUrl =
            await getSignedUrl(
                r2,
                command,
                {
                    expiresIn: 300,
                }
            );

        return NextResponse.json(
            {
                success: true,

                downloadUrl,

                expiresIn: 300,
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