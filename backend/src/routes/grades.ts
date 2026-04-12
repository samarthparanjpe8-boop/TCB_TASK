import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireTeacher } from "../middleware/auth.js";
import { Grade } from "../models/Grade.js";
import { parseObjectId } from "../lib/mongoId.js";
import { HttpError } from "../lib/httpErrors.js";
import {
  getCourseForTeacherOrThrow,
  assertStudentCanViewCourse,
  assertStudentEnrolled,
} from "../services/courseAccess.js";

export const gradesRouter = Router({ mergeParams: true });

gradesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    if (u.role === "teacher") {
      await getCourseForTeacherOrThrow(courseId, u);
      const list = await Grade.find({ courseId, deletedAt: null }).sort({ updatedAt: -1 }).lean();
      return res.json(
        list.map((g) => ({
          id: String(g._id),
          courseId: String(g.courseId),
          studentId: String(g.studentId),
          assignmentName: g.assignmentName,
          score: g.score,
          maxScore: g.maxScore,
          recordedBy: String(g.recordedBy),
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
        }))
      );
    }
    await assertStudentCanViewCourse(courseId, u);
    const list = await Grade.find({
      courseId,
      studentId: u._id,
      deletedAt: null,
    })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(
      list.map((g) => ({
        id: String(g._id),
        courseId: String(g.courseId),
        studentId: String(g.studentId),
        assignmentName: g.assignmentName,
        score: g.score,
        maxScore: g.maxScore,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }))
    );
  })
);

gradesRouter.post(
  "/",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    const { studentId, assignmentName, score, maxScore } = req.body as {
      studentId?: string;
      assignmentName?: string;
      score?: number;
      maxScore?: number;
    };
    if (!studentId || !assignmentName?.trim() || typeof score !== "number") {
      throw new HttpError(400, "studentId, assignmentName, and score are required");
    }
    const sid = parseObjectId(studentId, "studentId");
    await assertStudentEnrolled(courseId, sid);
    const max = typeof maxScore === "number" && maxScore > 0 ? maxScore : 100;
    if (score < 0 || score > max) throw new HttpError(400, "score must be between 0 and maxScore");
    const g = await Grade.create({
      courseId,
      studentId: sid,
      assignmentName: assignmentName.trim(),
      score,
      maxScore: max,
      recordedBy: u._id,
    });
    res.status(201).json({
      id: String(g._id),
      courseId: String(g.courseId),
      studentId: String(g.studentId),
      assignmentName: g.assignmentName,
      score: g.score,
      maxScore: g.maxScore,
    });
  })
);

gradesRouter.patch(
  "/:gradeId",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    const gradeId = parseObjectId(req.params.gradeId, "gradeId");
    const g = await Grade.findOne({ _id: gradeId, courseId, deletedAt: null });
    if (!g) throw new HttpError(404, "Grade not found");
    const { assignmentName, score, maxScore } = req.body as {
      assignmentName?: string;
      score?: number;
      maxScore?: number;
    };
    if (assignmentName !== undefined) g.assignmentName = assignmentName.trim();
    if (typeof maxScore === "number" && maxScore > 0) g.maxScore = maxScore;
    if (typeof score === "number") {
      if (score < 0 || score > g.maxScore) throw new HttpError(400, "score must be between 0 and maxScore");
      g.score = score;
    }
    await g.save();
    res.json({
      id: String(g._id),
      assignmentName: g.assignmentName,
      score: g.score,
      maxScore: g.maxScore,
    });
  })
);

gradesRouter.delete(
  "/:gradeId",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    const courseId = parseObjectId(req.params.courseId as string, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    const gradeId = parseObjectId(req.params.gradeId, "gradeId");
    const g = await Grade.findOne({ _id: gradeId, courseId, deletedAt: null });
    if (!g) throw new HttpError(404, "Grade not found");
    g.deletedAt = new Date();
    await g.save();
    res.status(204).send();
  })
);
