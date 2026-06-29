import { getCurrentUser } from "@/middlewares/auth.middleware";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const currentUser = await getCurrentUser(req);

        const {
            fullName,
            username,
            identity,
            learningLevel,
            interests,
            referralSource,
        } = await req.json();

        // Validation
        if (!fullName?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Full name is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!username?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!Array.isArray(interests)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Interests must be an array",
                },
                {
                    status: 400,
                }
            );
        }

        // Validate Username 
        const existingUser = await User.findOne({
            username: username.trim().toLowerCase(),
            _id: { $ne: currentUser._id },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username already taken",
                },
                {
                    status: 409,
                }
            );
        }

        // Update User
        currentUser.fullName = fullName.trim();
        currentUser.username = username.trim().toLowerCase();
        currentUser.identity = identity;
        currentUser.learningLevel = learningLevel;
        currentUser.interests = interests;
        currentUser.referralSource = referralSource;
        currentUser.onboardingCompleted = true;

        await currentUser.save();

        return NextResponse.json(
            {
                success: true,
                message: "Onboarding completed successfully",

                user: {
                    id: currentUser._id,
                    fullName: currentUser.fullName,
                    username: currentUser.username,
                    identity: currentUser.identity,
                    learningLevel:
                        currentUser.learningLevel,
                    interests:
                        currentUser.interests,
                    onboardingCompleted:
                        currentUser.onboardingCompleted,
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