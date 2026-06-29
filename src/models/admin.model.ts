import mongoose, { Model } from "mongoose";

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
}

export interface IAdmin {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  role: AdminRole;
  profileImage?: string;
  refreshToken?: string;
  activeSessionId?: string;
  lastLoginAt?: Date;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new mongoose.Schema<IAdmin>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.ADMIN,
    },
    profileImage: { type: String },
    refreshToken: { type: String, select: false },
    activeSessionId: { type: String },
    lastLoginAt: { type: Date },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", adminSchema);
export default Admin;
