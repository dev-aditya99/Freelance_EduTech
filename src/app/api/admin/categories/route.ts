import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Category from "@/models/category.model";
import { NextRequest, NextResponse } from "next/server";

// POST
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Verify Admin
    await getCurrentAdmin(req);

    const { name, description, image, parentCategory, sortOrder } =
      await req.json();

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required",
        },
        {
          status: 400,
        },
      );
    }

    // Generate Slug
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Parent Category Validation
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);

      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent category not found",
          },
          {
            status: 404,
          },
        );
      }
    }

    // Slug Check
    const existingSlug = await Category.findOne({
      slug,
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Category with same slug already exists",
        },
        {
          status: 409,
        },
      );
    }

    // Duplicate Check
    const existingCategory = await Category.findOne({
      name: name.trim(),
      parentCategory: parentCategory || null,
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category already exists",
        },
        {
          status: 409,
        },
      );
    }

    // Create Category
    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim(),
      image,
      parentCategory: parentCategory || null,
      sortOrder: sortOrder || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",

        category,
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

// GET
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

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const filter: any = {};

    // Search
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Status
    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const sort: any = {
      [sortBy]: sortOrder,
    };

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .populate("parentCategory", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Category.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        categories,
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
    handleApiError(error);
  }
}
