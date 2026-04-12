import mongoose, { Schema, type InferSchemaType } from "mongoose";

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: "" },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

courseSchema.index({ code: 1 }, { unique: true });

export type ICourse = InferSchemaType<typeof courseSchema>;
export const Course = mongoose.model("Course", courseSchema);
