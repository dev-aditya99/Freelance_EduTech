import { deleteCloudinaryImage } from "@/helpers/delete-cloudinary-image";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/handle-api-error";
import r2 from "@/lib/r2";
import { getCurrentAdmin } from "@/middlewares/admin.middleware";
import Category from "@/models/category.model";
import Course, { CourseStatus } from "@/models/course.model";
import Instructor from "@/models/instructor.model";
import Lesson, { LessonStatus, VideoStatus } from "@/models/lesson.model";
import Section from "@/models/section.model";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;

    if (!id) {
      NextResponse.json(
        {
          success: false,
          message: "Course id is requried",
        },
        {
          status: 404,
        },
      );
    }

    const course = await Course.find({ _id: id })
      .populate("category", "name slug")
      .populate("instructor", "fullName slug profileImage")
      .populate("createdBy", "fullName username email")
      .lean();

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found!",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Course found!",
        course,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleApiError(error);
  }
}

// Update Course
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        {
          status: 404,
        },
      );
    }

    // Category Validation
    if (body.category) {
      const category = await Category.findOne({
        _id: body.category,
        isActive: true,
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: "Category not found",
          },
          {
            status: 404,
          },
        );
      }

      course.category = body.category;
    }

    // Title + Slug
    if (body.title?.trim()) {
      course.title = body.title.trim();

      const slug = body.title
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const existingSlug = await Course.findOne({
        slug,
        _id: { $ne: course._id },
      });

      course.slug = existingSlug ? `${slug}-${Date.now()}` : slug;
    }

    if (body.shortDescription?.trim()) {
      course.shortDescription = body.shortDescription.trim();
    }

    if (body.description?.trim()) {
      course.description = body.description.trim();
    }

    if (body.thumbnail !== undefined && body.thumbnailPublicId !== undefined) {
      course.thumbnail = body.thumbnail;
      course.thumbnailPublicId = body.thumbnailPublicId;
    }

    if (body.whatYouWillLearn !== undefined) {
      course.whatYouWillLearn = Array.isArray(body.whatYouWillLearn)
        ? body.whatYouWillLearn
        : [];
    }

    if (body.requirements !== undefined) {
      course.requirements = Array.isArray(body.requirements)
        ? body.requirements
        : [];
    }

    if (body.targetAudience !== undefined) {
      course.targetAudience = Array.isArray(body.targetAudience)
        ? body.targetAudience
        : [];
    }

    // Free/Paid
    if (body.isFree !== undefined) {
      course.isFree = body.isFree;

      if (body.isFree) {
        course.price = 0;
        course.discountPrice = 0;
      } else {
        if (body.price === undefined || body.price === null) {
          return NextResponse.json(
            {
              success: false,
              message: "Price is required",
            },
            {
              status: 400,
            },
          );
        }

        const price = Number(body.price);
        const discountPrice = Number(body.discountPrice);

        if (body.discountPrice !== undefined && discountPrice > price) {
          return NextResponse.json(
            {
              success: false,
              message: "Discount price cannot exceed price",
            },
            {
              status: 400,
            },
          );
        }

        course.price = body.price;
        course.discountPrice = body.discountPrice;
      }
    }

    if (body.instructor) {
      const foundInstructor = await Instructor.findById(body.instructor);

      if (!foundInstructor) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Instructor!",
          },
          { status: 400 },
        );
      }
      course.instructor = body.instructor;
    }

    // Course Level
    if (body.level) {
      course.level = body.level;
    }

    // Course Language
    if (body.course_language) {
      course.course_language = body.course_language;
    }

    // Course SEO Title
    if (body.seoTitle) {
      course.seoTitle = body.seoTitle;
    }

    // Course SEO Description
    if (body.seoDescription) {
      course.seoDescription = body.seoDescription;
    }

    // Course SEO Keywords
    if (body.seoKeywords !== undefined) {
      course.seoKeywords = Array.isArray(body.seoKeywords)
        ? body.seoKeywords
        : [];
    }

    // Course Is Featured ?
    if (body.isFeatured) {
      course.isFeatured = body.isFeatured;
    }

    await course.save();

    return NextResponse.json(
      {
        success: true,
        message: "Course updated successfully",
        course,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    handleApiError(error);
  }
}

// Delete or Archive Course
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await getCurrentAdmin(req);

    const { id } = await params;

    // queries
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          message: "No action found",
        },
        {
          status: 404,
        },
      );
    }

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        {
          status: 404,
        },
      );
    }

    // Check for the Sections and Lessons of the course
    const sections = await Section.find({ course: course._id });
    const lessons = await Lesson.find({ course: course._id });

    // Check Action conditions
    if (action == CourseStatus.DRAFT) {
      course.status = CourseStatus.DRAFT;
      course.isPublished = false;

      await course.save();

      return NextResponse.json(
        {
          success: true,
          message: "Invalid action!",
          course,
        },
        {
          status: 400,
        },
      );
    } else if (action == CourseStatus.ARCHIVED) {
      // If Enrollment count is greater then 0

      await Promise.all(
        lessons.map(async (lesson) => {
          // Find the section
          const section = sections.find(
            (sec) => sec._id.toString() === lesson.section.toString(),
          );

          // if section not
          if (!section) {
            return NextResponse.json(
              {
                success: false,
                message: `Course archive failed due to Unable to find section for the lesson: "${lesson.title}"`,
              },
              {
                status: 404,
              },
            );
          }

          // delete thumbail
          if (lesson.thumbnailUrl && lesson.thumbnailPublicId) {
            const isDeleted = await deleteCloudinaryImage(
              lesson.thumbnailPublicId,
            );

            if (!isDeleted) {
              return NextResponse.json(
                {
                  success: false,
                  message: `Course archive failed due to Unable to delete Thumbnail for the lesson: ${lesson.title} of Section: ${section.title}`,
                },
                {
                  status: 400,
                },
              );
            }

            lesson.thumbnailPublicId = undefined;
            lesson.thumbnailUrl = undefined;
          }

          // if video exist in the lesson
          if (lesson.videoStorageKey) {
            try {
              await r2.send(
                new DeleteObjectCommand({
                  Bucket: process.env.R2_BUCKET_NAME!,
                  Key: lesson.videoStorageKey,
                }),
              );

              lesson.videoMimeType = undefined;
              lesson.videoOriginalName = undefined;
              lesson.videoSize = undefined;
              lesson.videoStatus = VideoStatus.NOT_UPLOADED;
              lesson.videoStorageKey = undefined;

              section.totalDuration = section.totalDuration - lesson.duration;
              await section.save();
              course.totalDuration = course.totalDuration - lesson.duration;
              await course.save();
            } catch (error) {
              return NextResponse.json(
                {
                  success: false,
                  message: `Unable to delete course because video delete failed for the ${lesson.title} of Section: ${section.title}`,
                },
                {
                  status: 500,
                },
              );
            }
          }

          // if resources
          if (lesson.resources.length > 0) {
            for (const res of lesson.resources) {
              try {
                await r2.send(
                  new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME!,
                    Key: res.storageKey,
                  }),
                );

                await Lesson.findByIdAndUpdate(lesson._id, {
                  $pull: { resources: { _id: res._id } },
                });
              } catch (error) {
                return NextResponse.json(
                  {
                    success: false,
                    message: `Resource delete failed for ${res.title} in lesson: ${lesson.title}`,
                  },
                  { status: 500 },
                );
              }
            }

            lesson.resources = [];
          }

          lesson.status = LessonStatus.DRAFT;
          await lesson.save();
        }),
      );

      // if no enrollment
      if (course.enrollmentCount <= 0) {
        const isDeleted = await deleteCloudinaryImage(course.thumbnailPublicId);

        if (!isDeleted) {
          return NextResponse.json(
            {
              success: false,
              message: `Unable to delete Course because Thumbnail delete failed for the lesson.`,
            },
            {
              status: 400,
            },
          );
        }

        // Course Deleted
        await Lesson.deleteMany({ course: course._id });
        await Section.deleteMany({ course: course._id });
        await Course.deleteOne({ _id: course._id });

        return NextResponse.json(
          {
            success: true,
            message: "Course deleted successfully",
          },
          {
            status: 200,
          },
        );
      } else {
        // Course Archived
        course.status = CourseStatus.ARCHIVED;
        course.isPublished = false;

        await course.save();

        return NextResponse.json(
          {
            success: true,
            message: "Course archived successfully",
          },
          {
            status: 200,
          },
        );
      }
    } else {
      return NextResponse.json(
        {
          success: true,
          message: "Invalid action!",
        },
        {
          status: 400,
        },
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
