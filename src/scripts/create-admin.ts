import "dotenv/config";

import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Admin, { UserRole } from "@/models/user.model";
import { AdminRole } from "@/models/admin.model";

async function createAdmin() {
  await connectDB();

  const existingAdmin = await Admin.findOne({
    role: AdminRole.ADMIN,
  });

  if (existingAdmin) {
    console.log("Admin already exists.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);

  await Admin.create({
    fullName: process.env.ADMIN_NAME,
    username: process.env.ADMIN_USERNAME,
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    role: AdminRole.ADMIN,

    isEmailVerified: true,
    onboardingCompleted: true,
  });

  console.log("Admin created successfully.");

  process.exit(0);
}

createAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
