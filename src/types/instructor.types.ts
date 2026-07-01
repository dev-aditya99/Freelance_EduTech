export interface IInstructor {
  _id: string;
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

  createdAt: string;
  updatedAt: string;
}
