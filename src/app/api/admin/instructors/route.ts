import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Instructor from "@/models/instructor.model";
import { NextRequest, NextResponse } from "next/server";

// Create Instructor
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const {
      fullName,
      designation,
      headline,
      bio,
      experienceYears,
      profileImage,
      coverImage,
      linkedinUrl,
      youtubeUrl,
      websiteUrl,
    } = await req.json();

    if (!fullName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Instructor name is required",
        },
        { status: 400 },
      );
    }

    const slug = fullName
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existing = await Instructor.findOne({
      slug,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Instructor already exists",
        },
        { status: 409 },
      );
    }

    const instructor = await Instructor.create({
      fullName,
      slug,
      designation,
      headline,
      bio,
      experienceYears,
      profileImage,
      coverImage,
      linkedinUrl,
      youtubeUrl,
      websiteUrl,
    });

    return NextResponse.json(
      {
        success: true,
        instructor,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}

// Get All Instructors
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    const instructors = await Instructor.find({
      fullName: {
        $regex: search,
        $options: "i",
      },
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        instructors,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
