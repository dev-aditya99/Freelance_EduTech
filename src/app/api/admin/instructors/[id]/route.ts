import connectDB from "@/lib/db";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Instructor from "@/models/instructor.model";
import { NextRequest, NextResponse } from "next/server";

// Get Perticular Instructor
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { id } = await params;

    const instructor = await Instructor.findById(id);

    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Instructor not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        instructor,
      },
      {
        status: 200,
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

// Update Perticular Instructor
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await connectDB();

    await getCurrentAdmin(req);

    const { id } = await params;

    const body = await req.json();

    const instructor = await Instructor.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          message: "Instructor not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        instructor,
      },
      {
        status: 200,
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
