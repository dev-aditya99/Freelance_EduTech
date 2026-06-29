import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { verifyAccessToken } from "@/lib/jwt";
import { ApiError } from "@/lib/api-error";

export async function getCurrentUser(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token) as {
      _id: string;
      role: string;
    };

    const user = await User.findById(decoded._id).select("-refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.isBlocked) {
      throw new ApiError(403, "Your account has been blocked");
    }

    return user;
  } catch {
    throw new ApiError(401, "Unauthorized");
  }
}
