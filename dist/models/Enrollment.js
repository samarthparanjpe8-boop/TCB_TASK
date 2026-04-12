import mongoose, { Schema } from "mongoose";
const enrollmentSchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
        type: String,
        enum: ["active", "dropped"],
        default: "active",
    },
}, { timestamps: true });
enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });
export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
