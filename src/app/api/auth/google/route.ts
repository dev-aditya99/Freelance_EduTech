import { firebaseAuth } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Firebase ID token is required",
                },
                {
                    status: 400,
                }
            );
        }

        const decodedToken =
            await firebaseAuth.verifyIdToken(idToken);

        return NextResponse.json({
            success: true,
            firebaseUser: decodedToken,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Invalid Firebase token",
            },
            {
                status: 401,
            }
        );
    }
}