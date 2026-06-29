import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISection extends Document {
  title: string;
  course: mongoose.Types.ObjectId;
  sortOrder: number;

  totalLessons: number;
  totalDuration: number; // Seconds

  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    sortOrder: {
      type: Number,
      required: true,
      default: 1,
    },

    totalLessons: {
      type: Number,
      default: 0,
    },

    totalDuration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes

// Fast section listing inside a course
sectionSchema.index({
  course: 1,
  sortOrder: 1,
});

// Prevent duplicate section titles within same course
sectionSchema.index(
  {
    course: 1,
    title: 1,
  },
  {
    unique: true,
  },
);

const Section: Model<ISection> =
  mongoose.models.Section || mongoose.model<ISection>("Section", sectionSchema);

export default Section;
