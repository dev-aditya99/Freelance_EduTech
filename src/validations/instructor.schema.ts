import { z } from "zod";

export const instructorSchema = z.object({
  // Required fields
  fullName: z.string().min(3, "Full name must be at least 3 characters long"),
  email: z.string().email("Invalid email address format"), // required
  designation: z.string(), // required
  headline: z.string().max(100, "Headline must be under 100 characters"), // required
  bio: z.string(), // required
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative"), // required

  // Optional fields
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number format")
    .or(z.literal("")), // optional
  linkedinUrl: z.string().url("Invalid LinkedIn URL").or(z.literal("")), // optional
  youtubeUrl: z.string().url("Invalid YouTube URL").or(z.literal("")), // optional
  websiteUrl: z.string().url("Invalid Website URL").or(z.literal("")), // optional

  // Boolean with default
  isActive: z.boolean().default(true),
});

export type InstructorFormValues = z.infer<typeof instructorSchema>;
