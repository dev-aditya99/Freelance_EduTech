import { create } from "zustand";
import { Section, SectionCourse, Lesson } from "@/types/section.types";

import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getLessons,
  createLesson,
  updateLesson,
  getResourceURL,
  saveResource,
  deleteResource,
  deleteLesson,
  downloadResource,
} from "@/services/section.service";
import {
  deleteThumbnail,
  deleteVideo,
  getAllVideos,
  getVideoUploadURL,
  updateVideoLesson,
} from "@/services/video.service";

interface SectionState {
  course: SectionCourse | null;
  sections: Section[];
  loading: boolean;
  error: string | null;
  lesson: Lesson | null;
  fetchSections: (courseId: string) => Promise<void>;

  addSection: (
    courseId: string,
    payload: {
      title: string;
    },
  ) => Promise<void>;

  editSection: (
    sectionId: string,
    payload: {
      title?: string;
      sortOrder?: number;
    },
  ) => Promise<void>;

  removeSection: (sectionId: string) => Promise<void>;
  fetchLessons: (sectionId: string) => Promise<any[]>;
  addLesson: (sectionId: string, payload: any) => Promise<void>;
  updateLesson: (sectionId: string, payload: any) => Promise<void>;
  deleteLesson: (lessonId: string) => Promise<void>;

  // Resources
  getResourceURL: (sectionId: string, payload: any) => Promise<void>;
  saveResource: (sectionId: string, payload: any) => Promise<void>;
  deleteResource: (sectionId: string, resourceId: string) => Promise<void>;
  downloadResource: (lessonId: string, resourceId: string) => Promise<void>;

  // Video
  getVideoUploadURL: (payload: any) => Promise<void>;
  updateVideoLesson: (lessonId: string, payload: any) => Promise<void>;
  deleteVideo: (lessonId: string) => Promise<void>;
  getAllVideos: (params: string) => Promise<void>;

  // Thumbnail
  updateThumbnailURL_ID: (lessonId: string, payload: any) => Promise<void>;
  deleteThumbnail: (
    lessonId: string,
    thumbnailPublicId: string,
  ) => Promise<void>;
}

export const useSectionStore = create<SectionState>((set, get) => ({
  course: null,
  sections: [],
  loading: false,
  error: null,
  lesson: null,

  fetchSections: async (courseId) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const data = await getSections(courseId);

      set({
        course: data.course,
        sections: data.sections || [],
      });
    } catch (error: any) {
      set({
        error: error.message,
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  addSection: async (courseId, payload) => {
    await createSection(courseId, payload);
    await get().fetchSections(courseId);
  },

  editSection: async (sectionId, payload) => {
    await updateSection(sectionId, payload);
    const courseId = get().course?._id;

    if (courseId) {
      await get().fetchSections(courseId);
    }
  },

  removeSection: async (sectionId) => {
    await deleteSection(sectionId);
    const courseId = get().course?._id;

    if (courseId) {
      await get().fetchSections(courseId);
    }
  },

  fetchLessons: async (sectionId) => {
    const data = await getLessons(sectionId);
    return data.lessons || [];
  },

  addLesson: async (sectionId, payload) => {
    await createLesson(sectionId, payload);
    const courseId = get().course?._id;

    if (courseId) {
      await get().fetchSections(courseId);
    }
  },

  updateLesson: async (lessonId, payload) => {
    await updateLesson(lessonId, payload);

    const sectionId = get().lesson?.section;

    if (sectionId) {
      await get().fetchSections(sectionId);
    }
  },

  deleteLesson: async (lessonId) => {
    await deleteLesson(lessonId);
  },

  // Resources
  getResourceURL: async (payload) => {
    await getResourceURL(payload);
  },

  saveResource: async (lessonId, payload) => {
    await saveResource(lessonId, payload);

    const sectionId = get().lesson?.section;
  },

  deleteResource: async (lessonId, resourceId) => {
    await deleteResource(lessonId, resourceId);
  },

  downloadResource: async (lessonId, resourceId) => {
    await downloadResource(lessonId, resourceId);
  },

  // Videos
  getVideoUploadURL: async (payload) => {
    await getVideoUploadURL(payload);
  },

  updateVideoLesson: async (lessonId, payload) => {
    await updateVideoLesson(lessonId, payload);
  },

  deleteVideo: async (lessonId) => {
    await deleteVideo(lessonId);
  },

  getAllVideos: async (params) => {
    await getAllVideos(params);
  },

  // Thumbnails
  updateThumbnailURL_ID: async (lessonId, payload) => {
    await deleteThumbnail(lessonId, payload);
  },

  deleteThumbnail: async (lessonId, thumbnailPublicId) => {
    await deleteThumbnail(lessonId, thumbnailPublicId);
  },
}));
