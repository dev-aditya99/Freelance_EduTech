import mongoose, { Document, Model, Schema } from "mongoose";

export enum EnrollmentStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
    EXPIRED = "EXPIRED",
}

export interface IEnrollment extends Document {
    user: mongoose.Types.ObjectId;

    course: mongoose.Types.ObjectId;

    status: EnrollmentStatus;

    enrolledAt: Date;

    lastAccessedLesson?: mongoose.Types.ObjectId;
    lastAccessedAt?: Date;
    completedLessons: number


    expiresAt?: Date | null;

    progressPercentage: number;
    completedAt?: Date;

    certificateIssued: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(EnrollmentStatus),
            default: EnrollmentStatus.ACTIVE,
        },

        enrolledAt: {
            type: Date,
            default: Date.now,
        },

        lastAccessedLesson: {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
        },

        lastAccessedAt: {
            type: Date
        },

        completedLessons: {
            type: Number,
            default: 0,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        progressPercentage: {
            type: Number,
            default: 0,
        },

        completedAt: {
            type: Date,
        },

        certificateIssued: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// One Enrollment Per User Per Course
enrollmentSchema.index(
    {
        user: 1,
        course: 1,
    },
    {
        unique: true,
    }
);

// User's Courses
enrollmentSchema.index({
    user: 1,
    status: 1,
});

// Course Students
enrollmentSchema.index({
    course: 1,
    status: 1,
});

// Certificates
enrollmentSchema.index({
    certificateIssued: 1,
});

const Enrollment: Model<IEnrollment> =
    mongoose.models.Enrollment ||
    mongoose.model<IEnrollment>(
        "Enrollment",
        enrollmentSchema
    );

export default Enrollment;