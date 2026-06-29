import mongoose, {
    Document,
    Model,
    Schema,
} from "mongoose";

export interface IInstructor
    extends Document {

    fullName: string;
    slug: string;

    email?: string;
    phone?: string;

    profileImage?: string;
    coverImage?: string;

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

    createdAt: Date;
    updatedAt: Date;
}

const instructorSchema =
    new Schema<IInstructor>(
        {
            fullName: {
                type: String,
                required: true,
                trim: true,
            },

            slug: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
            },

            email: String,
            phone: String,

            profileImage: String,
            coverImage: String,

            designation: String,
            headline: String,

            bio: String,

            experienceYears: {
                type: Number,
                default: 0,
            },

            totalStudents: {
                type: Number,
                default: 0,
            },

            totalCourses: {
                type: Number,
                default: 0,
            },

            linkedinUrl: String,
            youtubeUrl: String,
            websiteUrl: String,

            isActive: {
                type: Boolean,
                default: true,
            },
        },
        {
            timestamps: true,
        }
    );

instructorSchema.index({
    slug: 1,
});

const Instructor: Model<IInstructor> =
    mongoose.models.Instructor ||
    mongoose.model<IInstructor>(
        "Instructor",
        instructorSchema
    );

export default Instructor;