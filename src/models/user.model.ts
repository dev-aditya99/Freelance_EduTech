import mongoose from "mongoose";

export enum UserRole {
  USER = "USER",
}

export enum UserIdentity {
  SCHOOL_STUDENT = "SCHOOL_STUDENT",
  COLLEGE_STUDENT = "COLLEGE_STUDENT",
  PROFESSIONAL = "PROFESSIONAL",
  OTHER = "OTHER",
}

export interface IUser {
  _id: mongoose.Types.ObjectId;
  fullName?: string;
  username?: string;
  email?: string;
  mobile?: string;
  password?: string;

  identity?: UserIdentity;
  learningLevel?: string;
  interests?: string[];

  referralSource?: string;
  onboardingCompleted: boolean;

  role: UserRole;

  isEmailVerified?: boolean;
  isMobileVerified?: boolean;

  googleId?: string;
  appleId?: string;

  profileImage?: string;

  refreshToken?: string;
  isBlocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 150,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      maxlength: 600,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxLength: 20,
    },
    password: {
      type: String,
      select: false,
      minLength: 8,
      maxLength: 100,
    },

    identity: {
      type: String,
      enum: Object.values(UserIdentity),
    },
    learningLevel: {
      type: String,
    },
    interests: {
      type: [String],
      default: [],
    },

    referralSource: {
      type: String,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    googleId: {
      type: String,
    },
    appleId: {
      type: String,
    },

    profileImage: {
      type: String,
    },

    refreshToken: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
