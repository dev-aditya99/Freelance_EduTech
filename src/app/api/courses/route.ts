import connectDB from "@/lib/db";
import Category from "@/models/category.model";
import Course, { CourseStatus } from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const page = Math.max(
            parseInt(searchParams.get("page") || "1"),
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(searchParams.get("limit") || "10"),
                1
            ),
            50
        );

        const skip = (page - 1) * limit;

        const search =
            searchParams.get("search")?.trim() || "";

        const category =
            searchParams.get("category");

        const isFree =
            searchParams.get("isFree");

        let sortBy =
            searchParams.get("sortBy") || "createdAt";

        const sortOrder =
            searchParams.get("sortOrder") === "asc"
                ? 1
                : -1;

        // Allowed Sort Fields
        const allowedSortFields = [
            "createdAt",
            "price",
            "enrollmentCount",
            "averageRating",
        ];

        if (!allowedSortFields.includes(sortBy)) {
            sortBy = "createdAt";
        }

        const filter: any = {
            status: CourseStatus.PUBLISHED,
            isPublished: true,
        };

        // Search
        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    shortDescription: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // Category Filter
        if (category) {
            const existingCategory =
                await Category.findOne({
                    _id: category,
                    isActive: true,
                });

            if (!existingCategory) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Category not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            filter.category = category;
        }

        // Free / Paid Filter
        if (isFree === "true") {
            filter.isFree = true;
        }

        if (isFree === "false") {
            filter.isFree = false;
        }

        const [courses, total] =
            await Promise.all([
                Course.find(filter)
                    .select(
                        `
                        title
                        slug
                        thumbnail
                        shortDescription
                        isFree
                        price
                        discountPrice
                        totalLessons
                        totalDuration
                        enrollmentCount
                        averageRating
                        category
                    `
                    )
                    .populate(
                        "category",
                        "name slug"
                    )
                    .sort({
                        [sortBy]: sortOrder,
                    })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                Course.countDocuments(filter),
            ]);

        return NextResponse.json(
            {
                success: true,

                courses,

                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(
                        total / limit
                    ),
                },
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