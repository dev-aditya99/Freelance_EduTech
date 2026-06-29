import connectDB from "@/lib/db";
import Course from "@/models/course.model";
import Review from "@/models/review.model";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/middlewares/auth.middleware";
import Enrollment from "@/models/enrollment.model";
import { handleApiError } from "@/lib/handle-api-error";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  },
) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);
    const { slug } = await params;
    const course = await Course.findOne({
      slug,
    });

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

    const reviews = await Review.find({
      course: course._id,
    })
      .populate("user", "fullName avatar")
      .sort({
        createdAt: -1,
      })
      .lean();

    const userReview = user
      ? await Review.findOne({
          user: user._id,
          course: course._id,
        })
      : null;

    return NextResponse.json(
      {
        success: true,
        total: reviews.length,
        reviews,
        userReview,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  },
) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const { slug } = await params;
    const { rating, review } = await req.json();
    const course = await Course.findOne({
      slug,
    });

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

    const enrollment = await Enrollment.findOne({
      user: user._id,
      course: course._id,
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          message: "You must enroll first",
        },
        {
          status: 403,
        },
      );
    }

    const existingReview = await Review.findOne({
      user: user._id,
      course: course._id,
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "Review already submitted",
        },
        {
          status: 409,
        },
      );
    }

    await Review.create({
      user: user._id,
      course: course._id,
      rating,
      review,
    });

    // Update Course Rating

    const stats = await Review.aggregate([
      {
        $match: {
          course: course._id,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
          totalRatings: {
            $sum: 1,
          },
        },
      },
    ]);

    await Course.findByIdAndUpdate(course._id, {
      averageRating: stats[0]?.averageRating || 0,

      totalRatings: stats[0]?.totalRatings || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted",
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
