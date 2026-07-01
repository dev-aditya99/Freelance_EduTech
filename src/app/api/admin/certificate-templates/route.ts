import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import CertificateTemplate from "@/models/certificate-template.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const templates = await CertificateTemplate.find()
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, templates }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { name, backgroundUrl, backgroundPublicId, isDefault } =
      await req.json();

    if (isDefault) {
      // Agar naya default ban raha hai, toh baki sabko false kardo
      await CertificateTemplate.updateMany({}, { isDefault: false });
    }

    const template = await CertificateTemplate.create({
      name,
      backgroundUrl,
      backgroundPublicId,
      isDefault,
    });

    return NextResponse.json(
      { success: true, message: "Template created", template },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
