import mongoose, { Model } from "mongoose";

export enum LoginRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export interface IAdminLoginRequest {
  admin: mongoose.Types.ObjectId;
  sessionId: string;
  deviceName: string;
  status: LoginRequestStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminLoginRequestSchema = new mongoose.Schema<IAdminLoginRequest>(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    sessionId: { type: String, required: true },
    deviceName: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(LoginRequestStatus),
      default: LoginRequestStatus.PENDING,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const AdminLoginRequest: Model<IAdminLoginRequest> =
  mongoose.models.AdminLoginRequest ||
  mongoose.model<IAdminLoginRequest>(
    "AdminLoginRequest",
    adminLoginRequestSchema,
  );
export default AdminLoginRequest;
