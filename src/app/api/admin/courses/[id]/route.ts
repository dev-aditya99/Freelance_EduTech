import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Category from "@/models/category.model";
import Course, { CourseStatus } from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;

    if (!id) {
      NextResponse.json(
        {
          success: false,
          message: "Course id is requried",
        },
        {
          status: 404,
        },
      );
    }

    const course = await Course.find({ _id: id })
      .populate("category", "name slug")
      .populate("createdBy", "fullName username email")
      .lean();

    if (!course) {
      NextResponse.json(
        {
          success: false,
          message: "Course not found!",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Course found!",
        course,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const course = await Course.findById(id);

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

    // Category Validation
    if (body.category) {
      const category = await Category.findOne({
        _id: body.category,
        isActive: true,
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: "Category not found",
          },
          {
            status: 404,
          },
        );
      }

      course.category = body.category;
    }

    // Title + Slug
    if (body.title?.trim()) {
      course.title = body.title.trim();

      const slug = body.title
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const existingSlug = await Course.findOne({
        slug,
        _id: { $ne: course._id },
      });

      course.slug = existingSlug ? `${slug}-${Date.now()}` : slug;
    }

    if (body.shortDescription?.trim()) {
      course.shortDescription = body.shortDescription.trim();
    }

    if (body.description?.trim()) {
      course.description = body.description.trim();
    }

    if (body.thumbnail !== undefined) {
      course.thumbnail = body.thumbnail;
    }

    if (body.whatYouWillLearn !== undefined) {
      course.whatYouWillLearn = Array.isArray(body.whatYouWillLearn)
        ? body.whatYouWillLearn
        : [];
    }

    if (body.requirements !== undefined) {
      course.requirements = Array.isArray(body.requirements)
        ? body.requirements
        : [];
    }

    if (body.targetAudience !== undefined) {
      course.targetAudience = Array.isArray(body.targetAudience)
        ? body.targetAudience
        : [];
    }

    // Free/Paid
    if (body.isFree !== undefined) {
      course.isFree = body.isFree;

      if (body.isFree) {
        course.price = 0;
        course.discountPrice = 0;
      } else {
        if (body.price === undefined || body.price === null) {
          return NextResponse.json(
            {
              success: false,
              message: "Price is required",
            },
            {
              status: 400,
            },
          );
        }

        if (
          body.discountPrice !== undefined &&
          body.discountPrice > body.price
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Discount price cannot exceed price",
            },
            {
              status: 400,
            },
          );
        }

        course.price = body.price;
        course.discountPrice = body.discountPrice;
      }
    }

    // Course Level
    if (body.level) {
      course.level = body.level;
    }

    // Course Language
    if (body.course_language) {
      course.course_language = body.course_language;
    }

    // Course SEO Title
    if (body.seoTitle) {
      course.seoTitle = body.seoTitle;
    }

    // Course SEO Description
    if (body.seoDescription) {
      course.seoDescription = body.seoDescription;
    }

    // Course SEO Keywords
    if (body.seoKeywords !== undefined) {
      course.seoKeywords = Array.isArray(body.seoKeywords)
        ? body.seoKeywords
        : [];
    }

    // Course Is Featured ?
    if (body.isFeatured) {
      course.isFeatured = body.isFeatured;
    }

    await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Course updated successfully",
        course,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;
    const course = await Course.findById(id);

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

    course.status = CourseStatus.ARCHIVED;
    course.isPublished = false;

    await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Course archived successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}
