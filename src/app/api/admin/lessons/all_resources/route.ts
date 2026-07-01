import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Lesson from "@/models/lesson.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search");
    const courseId = searchParams.get("courseId");
    const sectionId = searchParams.get("sectionId");
    const type = searchParams.get("type");

    // 1. Initial Match (Only lessons that have resources and match course/section)
    const initialMatch: any = {
      resources: { $exists: true, $not: { $size: 0 } },
    };
    if (courseId) initialMatch.course = new mongoose.Types.ObjectId(courseId);
    if (sectionId)
      initialMatch.section = new mongoose.Types.ObjectId(sectionId);

    // 2. Resource-level Match (Filter by search query or file type)
    const resourceMatch: any = {};
    if (search)
      resourceMatch["resources.title"] = { $regex: search, $options: "i" };
    if (type) resourceMatch["resources.type"] = type;

    const skip = (page - 1) * limit;

    // 3. Aggregation Pipeline
    const pipeline = [
      { $match: initialMatch },
      { $unwind: "$resources" }, // Flattens the resources array
      { $match: resourceMatch },
      { $sort: { "resources.uploadedAt": -1 } }, // Newest first
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "courses",
                localField: "course",
                foreignField: "_id",
                as: "courseInfo",
              },
            },
            {
              $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "sectionInfo",
              },
            },
            {
              $project: {
                _id: "$resources._id",
                title: "$resources.title",
                type: "$resources.type",
                storageKey: "$resources.storageKey",
                originalName: "$resources.originalName",
                mimeType: "$resources.mimeType",
                size: "$resources.size",
                uploadedAt: "$resources.uploadedAt",
                lessonId: "$_id",
                lessonTitle: "$title",
                course: { $arrayElemAt: ["$courseInfo", 0] },
                section: { $arrayElemAt: ["$sectionInfo", 0] },
              },
            },
          ],
        },
      },
    ];

    const result = await Lesson.aggregate(pipeline as any[]);
    const totalResources = result[0].metadata[0]?.total || 0;
    const resources = result[0].data;

    return NextResponse.json(
      {
        success: true,
        data: resources,
        pagination: {
          total: totalResources,
          page,
          limit,
          totalPages: Math.ceil(totalResources / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch Resources Error:", error);
    return handleApiError(error);
  }
}
