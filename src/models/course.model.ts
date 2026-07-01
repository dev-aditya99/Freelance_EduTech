import mongoose, { Document, Model, Schema } from "mongoose";

export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
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

export interface ICourse extends Document {
  title: string;
  slug: string;

  shortDescription: string;
  description: string;

  thumbnail?: string;
  thumbnailPublicId?: string;

  category: mongoose.Types.ObjectId;

  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience: string[];

  instructor?: mongoose.Types.ObjectId;
  level: CourseLevel;
  course_language?: CourseLanguage;
  searchLang?: string;

  isFree: boolean;
  price?: number;
  discountPrice?: number;

  totalSections: number;
  totalLessons: number;
  totalDuration: number; // In Seconds

  enrollmentCount: number;
  averageRating: number;
  totalRatings: number;

  isFeatured: boolean;

  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  status: CourseStatus;
  isPublished: boolean;

  createdBy: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      // unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnail: {
      type: String,
      trim: true,
    },

    thumbnailPublicId: {
      type: String,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    whatYouWillLearn: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    targetAudience: {
      type: [String],
      default: [],
    },

    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
    },

    level: {
      type: String,
      enum: CourseLevel,
      default: CourseLevel.BEGINNER,
    },

    course_language: {
      type: String,
      default: CourseLanguage.ENGLISH,
    },

    searchLang: {
      type: String,
      default: "none",
      select: false, // query me by default include nahi hoga
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    price: {
      type: Number,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
    },

    totalSections: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },

    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },

    seoTitle: {
      type: String,
      trim: true,
    },

    seoDescription: {
      type: String,
      trim: true,
    },

    seoKeywords: {
      type: [String],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Price Validation
courseSchema.pre("validate", function () {
  if (this.isFree) {
    this.price = 0;
    this.discountPrice = 0;
  } else {
    if (this.price === undefined || this.price === null) {
      throw new Error("Price is required for paid courses");
    }

    if (
      this.discountPrice !== undefined &&
      this.price != null &&
      this.discountPrice > this.price!
    ) {
      throw new Error("Discount price cannot exceed price");
    }
  }
});

// Indexes
courseSchema.index({ slug: 1 }, { unique: true });

courseSchema.index(
  {
    title: "text",
    shortDescription: "text",
  },
  { default_language: "ENGLISH" },
);

courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ enrollmentCount: -1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({
  isFeatured: 1,
});

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", courseSchema);

export default Course;
