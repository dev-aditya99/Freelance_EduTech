import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;

    description?: string;
    image?: string;

    parentCategory?: mongoose.Types.ObjectId | null;

    isActive: boolean;
    sortOrder: number;

    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: true,
            // unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        image: {
            type: String,
            trim: true,
        },

        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Prevent duplicate category names under same parent
categorySchema.index(
    {
        name: 1,
        parentCategory: 1,
    },
    {
        unique: true,
    }
);

const Category: Model<ICategory> =
    mongoose.models.Category ||
    mongoose.model<ICategory>(
        "Category",
        categorySchema
    );

export default Category;