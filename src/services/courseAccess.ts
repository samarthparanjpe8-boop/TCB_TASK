import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { HttpError } from "../lib/httpErrors.js";
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../models/User.js";
import type { ICourse } from "../models/Course.js";
import mongoose from "mongoose";

export async function getCourseForTeacherOrThrow(
  courseId: mongoose.Types.ObjectId,
  teacher: HydratedDocument<IUser>
): Promise<HydratedDocument<ICourse>> {
  const course = await Course.findById(courseId);
  if (!course) throw new HttpError(404, "Course not found");
  if (!course.teacherId.equals(teacher._id)) throw new HttpError(403, "Not allowed for this course");
  return course;
}

export async function assertStudentEnrolled(
  courseId: mongoose.Types.ObjectId,
  studentId: mongoose.Types.ObjectId
) {
  const en = await Enrollment.findOne({
    courseId,
    studentId,
    status: "active",
  });
  if (!en) throw new HttpError(400, "Student is not actively enrolled in this course");
}

export async function assertStudentCanViewCourse(
  courseId: mongoose.Types.ObjectId,
  student: HydratedDocument<IUser>
) {
  const en = await Enrollment.findOne({
    courseId,
    studentId: student._id,
    status: "active",
  });
  if (!en) throw new HttpError(403, "Not enrolled in this course");
}
