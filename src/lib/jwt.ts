import { IAdmin } from "@/models/admin.model";
import { IUser } from "@/models/user.model";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is missing");
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET is missing");
}

// USER TOKENS
export const generateAccessToken = (user: Partial<IUser>) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

export const generateRefreshToken = (user: Partial<IUser>) => {
  return jwt.sign(
    {
      _id: user._id,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    },
  );
};

// ADMIN TOKENS

export const generateAccessTokenAdmin = (admin: {
  _id: string;
  role: string;
  sessionId: string;
}) => {
  return jwt.sign(
    {
      _id: admin._id,
      role: admin.role,
      sessionId: admin.sessionId,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

export const generateRefreshTokenAdmin = (admin: {
  _id: string;
  sessionId: string;
}) => {
  return jwt.sign(
    {
      _id: admin._id,
      sessionId: admin.sessionId,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    },
  );
};

// VERIFY

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
