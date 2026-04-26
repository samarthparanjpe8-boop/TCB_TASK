import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    authId: { type: String, index: true, unique: true, sparse: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    registrationMarks: { type: Number, default: null },
    role: { type: String, enum: ["teacher", "student"], required: true },
    isApproved: { type: Boolean, default: true },
    approvalToken: { type: String, default: null },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export type IUser = InferSchemaType<typeof userSchema>;
export const User = mongoose.model("User", userSchema);
