import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireTeacher } from "../middleware/auth.js";
import { Attendance } from "../models/Attendance.js";
import { parseObjectId } from "../lib/mongoId.js";
import { HttpError } from "../lib/httpErrors.js";
import { utcDayStart } from "../lib/date.js";
import {
  getCourseForTeacherOrThrow,
  assertStudentCanViewCourse,
  assertStudentEnrolled,
} from "../services/courseAccess.js";

const statuses = ["present", "absent", "late", "excused"] as const;

export const attendanceRouter = Router({ mergeParams: true });

attendanceRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    const { from, to } = req.query as { from?: string; to?: string };
    if (u.role === "teacher") {
      await getCourseForTeacherOrThrow(courseId, u);
      const q: Record<string, unknown> = { courseId, deletedAt: null };
      if (from && to) {
        q.date = { $gte: utcDayStart(from), $lte: utcDayStart(to) };
      }
      const list = await Attendance.find(q).sort({ date: -1 }).lean();
      return res.json(
        list.map((a) => ({
          id: String(a._id),
          courseId: String(a.courseId),
          studentId: String(a.studentId),
          date: a.date.toISOString().slice(0, 10),
          status: a.status,
          recordedBy: String(a.recordedBy),
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        }))
      );
    }
    await assertStudentCanViewCourse(courseId, u);
    const q: Record<string, unknown> = { courseId, studentId: u._id, deletedAt: null };
    if (from && to) {
      q.date = { $gte: utcDayStart(from), $lte: utcDayStart(to) };
    }
    const list = await Attendance.find(q).sort({ date: -1 }).lean();
    res.json(
      list.map((a) => ({
        id: String(a._id),
        courseId: String(a.courseId),
        studentId: String(a.studentId),
        date: a.date.toISOString().slice(0, 10),
        status: a.status,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }))
    );
  })
);

attendanceRouter.post(
  "/",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    const { studentId, date, status } = req.body as {
      studentId?: string;
      date?: string;
      status?: string;
    };
    if (!studentId || !date || !status) {
      throw new HttpError(400, "studentId, date (YYYY-MM-DD UTC), and status are required");
    }
    if (!statuses.includes(status as (typeof statuses)[number])) {
      throw new HttpError(400, "status must be present|absent|late|excused");
    }
    const sid = parseObjectId(studentId, "studentId");
    await assertStudentEnrolled(courseId, sid);
    let day: Date;
    try {
      day = utcDayStart(date);
    } catch {
      throw new HttpError(400, "Invalid date format; use YYYY-MM-DD");
    }
    const doc = await Attendance.findOneAndUpdate(
      { courseId, studentId: sid, date: day },
      {
        $set: {
          status,
          recordedBy: u._id,
          deletedAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({
      id: String(doc!._id),
      courseId: String(doc!.courseId),
      studentId: String(doc!.studentId),
      date: doc!.date.toISOString().slice(0, 10),
      status: doc!.status,
    });
  })
);

attendanceRouter.patch(
  "/:attendanceId",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    const aid = parseObjectId(req.params.attendanceId, "attendanceId");
    const a = await Attendance.findOne({ _id: aid, courseId, deletedAt: null });
    if (!a) throw new HttpError(404, "Attendance not found");
    const { status, date } = req.body as { status?: string; date?: string };
    if (status !== undefined) {
      if (!statuses.includes(status as (typeof statuses)[number])) {
        throw new HttpError(400, "status must be present|absent|late|excused");
      }
      a.status = status as (typeof statuses)[number];
    }
    if (date !== undefined) {
      try {
        a.date = utcDayStart(date);
      } catch {
        throw new HttpError(400, "Invalid date format; use YYYY-MM-DD");
      }
    }
    a.recordedBy = u._id;
    try {
      await a.save();
    } catch (e) {
      if (e && typeof e === "object" && "code" in e && (e as { code?: number }).code === 11000) {
        throw new HttpError(409, "Another record already exists for this student and date");
      }
      throw e;
    }
    res.json({
      id: String(a._id),
      date: a.date.toISOString().slice(0, 10),
      status: a.status,
    });
  })
);

attendanceRouter.delete(
  "/:attendanceId",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    const aid = parseObjectId(req.params.attendanceId, "attendanceId");
    const a = await Attendance.findOne({ _id: aid, courseId, deletedAt: null });
    if (!a) throw new HttpError(404, "Attendance not found");
    a.deletedAt = new Date();
    await a.save();
    res.status(204).send();
  })
);
