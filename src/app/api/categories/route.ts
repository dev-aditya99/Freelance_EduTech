import connectDB from "@/lib/db";
import Category from "@/models/category.model";

import {
    NextRequest,
    NextResponse,
} from "next/server";

export async function GET(
    req: NextRequest
) {
    try {

        await connectDB();

        const categories =
            await Category.find({
                isActive: true,
            })
                .select(`
                    name
                    slug
                    image
                    description
                    sortOrder
                `)
                .sort({
                    sortOrder: 1,
                    name: 1,
                })
                .lean();

        return NextResponse.json(
            {
                success: true,

                total:
                    categories.length,

                categories,
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