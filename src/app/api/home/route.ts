import connectDB from "@/lib/db";
import { getCurrentUser } from "@/middlewares/auth.middleware";

import Course, { CourseStatus } from "@/models/course.model";

import Category from "@/models/category.model";
import Instructor from "@/models/instructor.model";
import "@/models/lesson.model";

import Enrollment, { EnrollmentStatus } from "@/models/enrollment.model";

import Progress from "@/models/progress.model";
import Certificate from "@/models/certificate.model";

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/handle-api-error";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(req);

    const [
      continueLearning,
      categories,
      featuredCourses,
      popularCourses,
      recentCourses,
      topInstructors,

      recommendedCourses,

      enrolledCourses,
      completedCourses,
      certificates,

      learningStats,
    ] = await Promise.all([
      Progress.findOne({
        user: user._id,
      })
        .populate({
          path: "course",
          select: `
                        title
                        slug
                        thumbnail
                    `,
        })
        .populate({
          path: "lesson",
          select: `
                        title
                        slug
                    `,
        })
        .sort({
          updatedAt: -1,
        })
        .lean(),

      Category.find({
        isActive: true,
      })
        .select(
          `
                    name
                    slug
                `,
        )
        .sort({
          sortOrder: 1,
        })
        .lean(),

      Course.find({
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        isFeatured: true,
      })
        .select(
          `
                    title
                    slug
                    thumbnail
                    shortDescription

                    price
                    discountPrice

                    averageRating
                    enrollmentCount

                    category
                `,
        )
        .populate("category", "name slug")
        .limit(10)
        .lean(),

      Course.find({
        status: CourseStatus.PUBLISHED,
        isPublished: true,
      })
        .select(
          `
                    title
                    slug
                    thumbnail
                    shortDescription

                    price
                    discountPrice

                    averageRating
                    enrollmentCount

                    category
                `,
        )
        .populate("category", "name slug")
        .sort({
          enrollmentCount: -1,
        })
        .limit(10)
        .lean(),

      Course.find({
        status: CourseStatus.PUBLISHED,
        isPublished: true,
      })
        .select(
          `
                    title
                    slug
                    thumbnail
                    shortDescription

                    price
                    discountPrice

                    averageRating
                    enrollmentCount

                    category
                `,
        )
        .populate("category", "name slug")
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean(),

      Instructor.find({
        isActive: true,
      })
        .select(
          `
                    fullName
                    slug
                    profileImage

                    title
                    totalStudents
                    totalCourses
                `,
        )
        .sort({
          totalStudents: -1,
        })
        .limit(10)
        .lean(),

      Course.find({
        status: CourseStatus.PUBLISHED,
        isPublished: true,
      })
        .select(
          `
        title
        slug
        thumbnail

        averageRating
        enrollmentCount

        price
        discountPrice

        category
    `,
        )
        .populate("category", "name slug")
        .sort({
          averageRating: -1,
        })
        .limit(10)
        .lean(),

      Enrollment.countDocuments({
        user: user._id,
        status: EnrollmentStatus.ACTIVE,
      }),

      Enrollment.countDocuments({
        user: user._id,
        progressPercentage: 100,
      }),

      Certificate.countDocuments({
        user: user._id,
      }),

      Progress.aggregate([
        {
          $match: {
            user: user._id,
          },
        },
        {
          $group: {
            _id: null,
            totalWatchTime: {
              $sum: "$watchedDuration",
            },
          },
        },
      ]),
    ]);

    const totalLearningHours = Math.floor(
      (learningStats?.[0]?.totalWatchTime || 0) / 3600,
    );

    return NextResponse.json(
      {
        success: true,

        user: {
          fullName: user.fullName,
          profileImage: user.profileImage,
          learningLevel: user.learningLevel,
          interests: user.interests,
        },
        continueLearning,

        stats: {
          enrolledCourses,
          completedCourses,
          certificates,
          totalLearningHours,
        },

        achievement: {
          currentStreak: 7,
          weeklyLessonsCompleted: 12,
          weeklyGoal: 20,
        },

        categories,
        featuredCourses,
        popularCourses,
        recentCourses,
        topInstructors,
        recommendedCourses,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
