import connectDB from "@/lib/db";
import { getCurrentUser } from "@/middlewares/auth.middleware";
import Wishlist from "@/models/wishlist.model";
import Course from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const { courseId } = await req.json();

    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        {
          status: 404,
        },
      );
    }

    const exists = await Wishlist.findOne({
      user: user._id,
      course: courseId,
    });

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Already wishlisted",
        },
        {
          status: 409,
        },
      );
    }

    await Wishlist.create({
      user: user._id,
      course: courseId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Added to wishlist",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const wishlist = await Wishlist.find({
      user: user._id,
    })
      .populate({
        path: "course",
        select: `
                title
                slug
                thumbnail
                averageRating
                enrollmentCount
                price
                discountPrice
                    `,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        wishlist,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }

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
