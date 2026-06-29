import mongoose from "mongoose";


export interface IOTP {
    phone: string;
    otp: string;
    expiresAt: Date;
    attempts: number;
    requestCount: number;
    createdAt: Date;
    updatedAt?: Date
}

const OTPSchema = new mongoose.Schema<IOTP>({
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true
    },

    attempts: {
        type: Number,
        default: 0
    },

    requestCount: {
        type: Number,
        default: 1,
    },

}, {
    timestamps: true
})


OTPSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
)

const Otp = mongoose.models?.Otp || mongoose.model('Otp', OTPSchema);

export default Otp;