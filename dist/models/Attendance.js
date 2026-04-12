import mongoose, { Schema } from "mongoose";
const attendanceSchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ["present", "absent", "late", "excused"],
        required: true,
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });
attendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });
export const Attendance = mongoose.model("Attendance", attendanceSchema);
