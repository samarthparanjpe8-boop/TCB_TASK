import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    authId: { type: String, index: true, unique: true, sparse: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    role: { type: String, enum: ["teacher", "student"], required: true },
    archivedAt: { type: Date, default: null },
}, { timestamps: true });
userSchema.index({ email: 1 }, { unique: true });
export const User = mongoose.model("User", userSchema);
