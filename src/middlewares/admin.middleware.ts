import connectDB from "@/lib/db";
import Admin from "@/models/admin.model";
import { verifyAccessToken } from "@/lib/jwt";
import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/handle-api-error";

export async function getCurrentAdmin(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }

    const accessToken = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(accessToken) as {
      _id: string;
      role: string;
      sessionId?: string;
    };

    const admin = await Admin.findById(decoded._id).select(
      "+refreshToken +activeSessionId",
    );

    if (!admin) {
      throw new Error("Admin not found");
    }

    if (admin.isBlocked) {
      throw new Error("Admin account blocked");
    }

    if (
      decoded.sessionId &&
      admin.activeSessionId &&
      decoded.sessionId !== admin.activeSessionId
    ) {
      const error = new Error("Session expired");
      (error as any).statusCode = 401;
      throw error;
    }

    return admin;
  } catch (error) {
    handleApiError(error);
  }
}
