import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProgress extends Document {
    user: mongoose.Types.ObjectId;

    course: mongoose.Types.ObjectId;

    lesson: mongoose.Types.ObjectId;

    lastWatchedPosition: number; // Seconds

    watchedDuration: number; // Seconds

    isCompleted: boolean;

    completedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
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

        lesson: {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
            required: true,
        },

        lastWatchedPosition: {
            type: Number,
            default: 0,
            min: 0,
        },

        watchedDuration: {
            type: Number,
            default: 0,
            min: 0,
        },

        isCompleted: {
            type: Boolean,
            default: false,
        },

        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// One Progress Record Per User Per Lesson
progressSchema.index(
    {
        user: 1,
        course: 1,
        lesson: 1,
    },
    {
        unique: true,
    }
);

// Continue Learning
progressSchema.index({
    user: 1,
    updatedAt: -1,
});

// Course Progress
progressSchema.index({
    user: 1,
    course: 1,
});

// Completed Lessons
progressSchema.index({
    user: 1,
    isCompleted: 1,
});

const Progress: Model<IProgress> =
    mongoose.models.Progress ||
    mongoose.model<IProgress>(
        "Progress",
        progressSchema
    );

export default Progress;