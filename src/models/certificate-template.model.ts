import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICertificateTemplate extends Document {
  name: string;
  backgroundUrl: string; // The blank template image (Cloudinary/R2 URL)
  backgroundPublicId: string;
  isDefault: boolean; // Konsa template currently active course ke liye use hoga
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const certificateTemplateSchema = new Schema<ICertificateTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    backgroundUrl: {
      type: String,
      required: true,
    },
    backgroundPublicId: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const CertificateTemplate: Model<ICertificateTemplate> =
  mongoose.models.CertificateTemplate ||
  mongoose.model<ICertificateTemplate>(
    "CertificateTemplate",
    certificateTemplateSchema,
  );

export default CertificateTemplate;
