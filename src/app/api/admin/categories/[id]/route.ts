import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Category from "@/models/category.model";
import Course from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;

    const category = await Category.findById(id).populate(
      "parentCategory",
      "name slug",
    );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error: any) {
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

    const { name, description, image, parentCategory, sortOrder } =
      await req.json();

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    if (name) {
      category.name = name.trim();

      category.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    category.description = description;
    category.image = image;
    category.parentCategory = parentCategory || null;
    category.sortOrder = sortOrder ?? category.sortOrder;

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
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

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    const coursesCount = await Course.countDocuments({
      category: id,
    });

    // If Course Count 0
    if (coursesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `This category is linked to ${coursesCount} courses and cannot be deleted until it is unassigned.`,
        },
        { status: 400 },
      );
    }

    // HARD DELETE
    if (coursesCount === 0) {
      await Category.findByIdAndDelete(id);

      return NextResponse.json(
        {
          success: true,
          message: "Category deleted permanently.",
        },
        {
          status: 200,
        },
      );
    }
  } catch (error: any) {
    handleApiError(error);
  }
}
