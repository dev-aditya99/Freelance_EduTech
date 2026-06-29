import mongoose, {
    Document,
    Model,
    Schema,
} from "mongoose";

export interface IReview
    extends Document {

    user:
    mongoose.Types.ObjectId;

    course:
    mongoose.Types.ObjectId;

    rating: number;

    review?: string;

    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema =
    new Schema<IReview>(
        {
            user: {
                type:
                    Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            course: {
                type:
                    Schema.Types.ObjectId,
                ref: "Course",
                required: true,
            },

            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },

            review: {
                type: String,
                trim: true,
                maxlength: 1000,
            },
        },
        {
            timestamps: true,
        }
    );

// One Review Per User Per Course
reviewSchema.index(
    {
        user: 1,
        course: 1,
    },
    {
        unique: true,
    }
);

const Review: Model<IReview> =
    mongoose.models.Review ||
    mongoose.model<IReview>(
        "Review",
        reviewSchema
    );

export default Review;