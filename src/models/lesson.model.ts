import mongoose, { Document, Model, Schema } from "mongoose";

export enum LessonStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export enum VideoStatus {
  NOT_UPLOADED = "NOT_UPLOADED",
  UPLOADING = "UPLOADING",
  PROCESSING = "PROCESSING",
  READY = "READY",
  FAILED = "FAILED",
}

export enum ResourceType {
  PDF = "PDF",
  DOC = "DOC",
  DOCX = "DOCX",
  PPT = "PPT",
  PPTX = "PPTX",
  XLS = "XLS",
  XLSX = "XLSX",
  TXT = "TXT",
  ZIP = "ZIP",
  RAR = "RAR",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  CODE = "CODE",
  OTHER = "OTHER",
}

export enum PlaybackType {
  MP4 = "MP4",
  HLS = "HLS",
}

export interface ILessonResource {
  _id?: mongoose.Types.ObjectId;

  title: string;

  storageKey: string;

  originalName?: string;

  mimeType?: string;

  size?: number;

  type?: ResourceType;

  uploadedAt?: Date;
}

export interface ILesson extends Document {
  title: string;
  description?: string;
  section: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;

  // Video
  videoStorageKey?: string;
  videoOriginalName?: string;
  videoMimeType?: string;
  videoSize?: number;
  videoStatus: VideoStatus;
  playbackType: PlaybackType;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  duration: number;
  uploadedAt?: Date;
  uploadedBy?: mongoose.Types.ObjectId;

  // Resources
  resources: ILessonResource[];
  isPreview: boolean;
  isDownloadable: boolean;
  status: LessonStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Video
    videoStorageKey: {
      type: String,
      trim: true,
    },

    videoOriginalName: {
      type: String,
      trim: true,
    },

    videoMimeType: {
      type: String,
      trim: true,
    },

    videoSize: {
      type: Number,
      min: 0,
    },

    videoStatus: {
      type: String,
      enum: Object.values(VideoStatus),
      default: VideoStatus.NOT_UPLOADED,
    },

    playbackType: {
      type: String,
      enum: Object.values(PlaybackType),
      default: PlaybackType.MP4,
    },

    thumbnailUrl: {
      type: String,
      trim: true,
    },

    thumbnailPublicId: {
      type: String,
      trim: true,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    uploadedAt: {
      type: Date,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },

    // Resources
    resources: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },

        storageKey: {
          type: String,
          trim: true,
        },

        originalName: {
          type: String,
          trim: true,
        },

        mimeType: {
          type: String,
          trim: true,
        },

        size: {
          type: Number,
          min: 0,
        },

        type: {
          type: String,
          enum: Object.values(ResourceType),
          default: ResourceType.OTHER,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isPreview: {
      type: Boolean,
      default: false,
    },

    isDownloadable: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(LessonStatus),
      default: LessonStatus.DRAFT,
    },

    sortOrder: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// Fast lesson listing inside section
lessonSchema.index({
  section: 1,
  sortOrder: 1,
});

// Fast lesson listing inside course
lessonSchema.index({
  course: 1,
  sortOrder: 1,
});

// Prevent duplicate lesson titles inside same section
lessonSchema.index(
  {
    section: 1,
    title: 1,
  },
  {
    unique: true,
  },
);

// Filters
lessonSchema.index({
  status: 1,
});

lessonSchema.index({
  isPreview: 1,
});

lessonSchema.index({
  videoStatus: 1,
});

lessonSchema.index({
  uploadedBy: 1,
});

const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", lessonSchema);

export default Lesson;
