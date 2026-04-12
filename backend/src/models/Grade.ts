import mongoose, { Schema, type InferSchemaType } from "mongoose";

const gradeSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignmentName: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true, default: 100 },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

gradeSchema.index({ courseId: 1, studentId: 1, assignmentName: 1 });

export type IGrade = InferSchemaType<typeof gradeSchema>;
export const Grade = mongoose.model("Grade", gradeSchema);
