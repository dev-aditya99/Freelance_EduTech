import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInstructor extends Document {
  fullName: string;
  slug: string;

  email?: string;
  phone?: string;

  profileImage?: string;
  profileImagePublicId?: string;

  coverImage?: string;
  coverImagePublicId?: string;

  designation?: string;
  headline?: string;

  bio?: string;

  experienceYears: number;

  totalStudents: number;
  totalCourses: number;

  linkedinUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const instructorSchema = new Schema<IInstructor>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      maxlength: 600,
    },

    phone: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      trim: true,
    },
    profileImagePublicId: {
      type: String,
      trim: true,
    },

    coverImage: {
      type: String,
      trim: true,
    },

    coverImagePublicId: {
      type: String,
      trim: true,
    },

    designation: String,
    headline: String,

    bio: String,

    experienceYears: {
      type: Number,
      default: 0,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },

    totalCourses: {
      type: Number,
      default: 0,
    },

    linkedinUrl: String,
    youtubeUrl: String,
    websiteUrl: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

instructorSchema.index({
  slug: 1,
});

const Instructor: Model<IInstructor> =
  mongoose.models.Instructor ||
  mongoose.model<IInstructor>("Instructor", instructorSchema);

export default Instructor;
