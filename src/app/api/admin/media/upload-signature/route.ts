import cloudinary from "@/lib/cloudinary";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";

import { AdminRole } from "@/models/admin.model";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req);

    if (admin?.role !== AdminRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 403,
        },
      );
    }

    const { folder = "edtech" } = await req.json();

    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type: "video",
      },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return NextResponse.json(
      {
        success: true,

        data: {
          timestamp,

          signature,

          cloudName: process.env.CLOUDINARY_CLOUD_NAME,

          apiKey: process.env.CLOUDINARY_API_KEY,

          folder,
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
