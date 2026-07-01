import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Category from "@/models/category.model";
import Course, { CourseStatus } from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";
import "@/models/user.model";
import { handleApiError } from "@/lib/handle-api-error";
import Instructor from "@/models/instructor.model";
import { deleteCloudinaryImage } from "@/helpers/delete-cloudinary-image";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const admin = await getCurrentAdmin(req);

    if (!admin || admin == undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const {
      title,
      shortDescription,
      description,
      category,
      isFree,
      price,
      discountPrice,
      instructor,
    } = await req.json();

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 },
      );
    }

    if (!shortDescription?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Short description is required",
        },
        { status: 400 },
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Description is required",
        },
        { status: 400 },
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 },
      );
    }

    // Validate Category
    const existingCategory = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    // Paid Course Validation
    if (!isFree) {
      if (price === undefined || price === null) {
        return NextResponse.json(
          {
            success: false,
            message: "Price is required",
          },
          { status: 400 },
        );
      }

      const priceNum = Number(price);
      const discountPriceNum = Number(discountPrice);

      if (discountPrice !== undefined && discountPriceNum > priceNum) {
        return NextResponse.json(
          {
            success: false,
            message: "Discount price cannot exceed price",
          },
          { status: 400 },
        );
      }
    }

    if (instructor) {
      const foundInstructor = await Instructor.findById(instructor);

      if (!foundInstructor) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Instructor!",
          },
          { status: 400 },
        );
      }
    }

    // Generate Slug
    let slug = title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Make Slug Unique
    const existingSlug = await Course.findOne({
      slug,
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create Draft Course
    const course = await Course.create({
      title: title.trim(),
      slug,

      shortDescription: shortDescription.trim(),
      description: description.trim(),
      category,
      isFree,
      price: isFree ? 0 : price,
      discountPrice: isFree ? 0 : discountPrice,

      instructor,

      status: CourseStatus.DRAFT,
      isPublished: false,

      createdBy: admin?._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",

        course,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await getCurrentAdmin(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10"), 1),
      100,
    );
    const skip = (page - 1) * limit;
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    let sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Sort Field Whitelist
    const allowedSortFields = [
      "createdAt",
      "title",
      "enrollmentCount",
      "averageRating",
      "price",
    ];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "createdAt";
    }

    const filter: any = {};

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

    // Status Filter
    if (status) {
      filter.status = status;
    }

    // Category Filter
    if (category) {
      filter.category = category;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("category", "name slug image")
        .populate("instructor", "fullName slug profileImage")
        .populate("createdBy", "fullName username email")
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
          totalPages: Math.ceil(total / limit),
        },
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
