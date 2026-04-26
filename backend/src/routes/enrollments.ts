import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireTeacher } from "../middleware/auth.js";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";
import { parseObjectId } from "../lib/mongoId.js";
import { HttpError } from "../lib/httpErrors.js";
import { getCourseForTeacherOrThrow, assertStudentCanViewCourse } from "../services/courseAccess.js";

export const enrollmentsRouter = Router({ mergeParams: true });

enrollmentsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    if (u.role === "teacher") {
      await getCourseForTeacherOrThrow(courseId, u);
      const list = await Enrollment.find({ courseId }).populate("studentId").lean();
      return res.json(
        list.map((e) => {
          const st = e.studentId as unknown as { _id: unknown; email: string; displayName: string };
          return {
            id: String(e._id),
            courseId: String(e.courseId),
            studentId: String(st._id),
            studentEmail: st.email,
            studentDisplayName: st.displayName,
            status: e.status,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
          };
        })
      );
    }
    await assertStudentCanViewCourse(courseId, u);
    const e = await Enrollment.findOne({ courseId, studentId: u._id }).lean();
    if (!e) throw new HttpError(404, "Enrollment not found");
    res.json({
      id: String(e._id),
      courseId: String(e.courseId),
      studentId: String(e.studentId),
      status: e.status,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    });
  })
);

enrollmentsRouter.post(
  "/",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    const { studentId } = req.body as { studentId?: string };
    if (!studentId) throw new HttpError(400, "studentId is required");
    const sid = parseObjectId(studentId, "studentId");
    const student = await User.findOne({ _id: sid, role: "student", archivedAt: null });
    if (!student) throw new HttpError(404, "Student not found");
    const created = await Enrollment.findOneAndUpdate(
      { courseId, studentId: sid },
      { $set: { status: "active" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({
      id: String(created!._id),
      courseId: String(created!.courseId),
      studentId: String(created!.studentId),
      status: created!.status,
    });
  })
);

enrollmentsRouter.delete(
  "/:enrollmentId",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    const eid = parseObjectId(req.params.enrollmentId, "enrollmentId");
    const en = await Enrollment.findOne({ _id: eid, courseId });
    if (!en) throw new HttpError(404, "Enrollment not found");
    await en.deleteOne();
    res.status(204).send();
  })
);
