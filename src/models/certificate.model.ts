import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICertificate extends Document {
  user: mongoose.Types.ObjectId;
  studentName: string;
  course: mongoose.Types.ObjectId;
  enrollment: mongoose.Types.ObjectId;
  certificateNumber: string;
  pdfStorageKey?: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    enrollment: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },

    pdfStorageKey: {
      type: String,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

certificateSchema.index({
  user: 1,
  course: 1,
});

certificateSchema.index({
  certificateNumber: 1,
});

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", certificateSchema);

export default Certificate;
