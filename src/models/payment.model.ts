import mongoose, { Document, Model, Schema } from "mongoose";

export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}

export interface IPayment extends Document {
    user: mongoose.Types.ObjectId;

    course: mongoose.Types.ObjectId;

    enrollment?: mongoose.Types.ObjectId;

    amount: number;
    currency: string;

    status: PaymentStatus;

    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;

    receipt: string;

    failureReason?: string;

    refundedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
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

        enrollment: {
            type: Schema.Types.ObjectId,
            ref: "Enrollment",
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
        },

        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },

        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
        },

        razorpayPaymentId: {
            type: String,
        },

        razorpaySignature: {
            type: String,
        },

        receipt: {
            type: String,
        },

        failureReason: {
            type: String,
        },

        refundedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
paymentSchema.index({
    user: 1,
    createdAt: -1,
});

paymentSchema.index({
    course: 1,
});

paymentSchema.index({
    status: 1,
});

paymentSchema.index({
    razorpayPaymentId: 1,
});

const Payment: Model<IPayment> =
    mongoose.models.Payment ||
    mongoose.model<IPayment>(
        "Payment",
        paymentSchema
    );

export default Payment;