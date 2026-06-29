import { getCurrentUser } from "@/middlewares/auth.middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }
}