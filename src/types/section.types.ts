export interface Section {
  _id: string;
  title: string;
  course: string;
  totalLessons: number;
  totalDuration: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SectionCourse {
  _id: string;
  title: string;
  totalSections: number;
  totalLessons: number;
  totalDuration: number;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  course: string;
  section: string;
  duration: number;
  videoPublicId?: string;
  isPreview: boolean;
  isDownloadable: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaybackType {
  MP4: "MP4";
  HLS: "HLS";
}
