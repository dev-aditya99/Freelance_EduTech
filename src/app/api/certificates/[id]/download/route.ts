import connectDB from "@/lib/db";
import r2 from "@/lib/r2";
import { getCurrentUser } from "@/middlewares/auth.middleware";
import Certificate from "@/models/certificate.model";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

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
    const user = await getCurrentUser(req);
    const { id } = await params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return NextResponse.json(
        {
          success: false,
          message: "Certificate not found",
        },
        {
          status: 404,
        },
      );
    }

    // Ownership Check
    if (certificate.user.toString() !== user._id.toString()) {
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

    if (!certificate.pdfStorageKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Certificate PDF not generated yet",
        },
        {
          status: 400,
        },
      );
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: certificate.pdfStorageKey,
    });

    const downloadUrl = await getSignedUrl(r2, command, {
      expiresIn: 300,
    });

    return NextResponse.json(
      {
        success: true,
        certificateNumber: certificate.certificateNumber,
        downloadUrl,
        expiresIn: 300,
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
