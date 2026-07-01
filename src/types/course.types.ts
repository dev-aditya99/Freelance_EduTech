import { IAdmin } from "@/models/admin.model";
import { ICategory } from "@/models/category.model";

export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum CourseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT",
}

export enum CourseLanguage {
  HINDI = "HINDI",
  ENGLISH = "ENGLISH",
}

export interface Course {
  _id: string; // mapped from _id
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail?: string;
  thumbnailPublicId?: string;
  category: ICategory; // ObjectId string
  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience: string[];
  instructor?: string; // ObjectId string
  level: CourseLevel;
  language: CourseLanguage;
  course_language: CourseLanguage;
  isFree: boolean;
  price?: number;
  discountPrice?: number;
  totalSections?: number;
  totalLessons?: number;
  totalDuration?: number;
  averageRating?: number;
  totalRatings?: number;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  status: CourseStatus;
  isPublished: boolean;
  enrollmentCount: number; // For stats
  rating: number; // For stats
  createdBy: IAdmin;
  createdAt: string;
  updatedAt: string;
}
