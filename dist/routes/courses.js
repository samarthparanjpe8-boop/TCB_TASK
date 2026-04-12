import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireTeacher } from "../middleware/auth.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Grade } from "../models/Grade.js";
import { Attendance } from "../models/Attendance.js";
import { parseObjectId } from "../lib/mongoId.js";
import { HttpError } from "../lib/httpErrors.js";
import { getCourseForTeacherOrThrow, assertStudentCanViewCourse } from "../services/courseAccess.js";
export const coursesRouter = Router();
coursesRouter.get("/", asyncHandler(async (req, res) => {
    const u = req.authUser;
    if (u.role === "teacher") {
        const list = await Course.find({ teacherId: u._id }).sort({ code: 1 }).lean();
        return res.json(list.map((c) => ({
            id: String(c._id),
            title: c.title,
            code: c.code,
            description: c.description,
            teacherId: String(c.teacherId),
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        })));
    }
    const enrollments = await Enrollment.find({ studentId: u._id, status: "active" }).lean();
    const ids = enrollments.map((e) => e.courseId);
    const list = await Course.find({ _id: { $in: ids } }).sort({ code: 1 }).lean();
    res.json(list.map((c) => ({
        id: String(c._id),
        title: c.title,
        code: c.code,
        description: c.description,
        teacherId: String(c.teacherId),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    })));
}));
coursesRouter.post("/", requireTeacher, asyncHandler(async (req, res) => {
    const u = req.authUser;
    const { title, code, description } = req.body;
    if (!title?.trim() || !code?.trim())
        throw new HttpError(400, "title and code are required");
    const c = await Course.create({
        title: title.trim(),
        code: code.trim().toUpperCase(),
        description: (description ?? "").trim(),
        teacherId: u._id,
    });
    res.status(201).json({
        id: String(c._id),
        title: c.title,
        code: c.code,
        description: c.description,
        teacherId: String(c.teacherId),
    });
}));
coursesRouter.get("/:courseId", asyncHandler(async (req, res) => {
    const u = req.authUser;
    const courseId = parseObjectId(req.params.courseId, "courseId");
    const course = await Course.findById(courseId);
    if (!course)
        throw new HttpError(404, "Course not found");
    if (u.role === "teacher") {
        if (!course.teacherId.equals(u._id))
            throw new HttpError(403, "Not allowed");
    }
    else {
        await assertStudentCanViewCourse(courseId, u);
    }
    res.json({
        id: String(course._id),
        title: course.title,
        code: course.code,
        description: course.description,
        teacherId: String(course.teacherId),
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
    });
}));
coursesRouter.patch("/:courseId", requireTeacher, asyncHandler(async (req, res) => {
    const u = req.authUser;
    const courseId = parseObjectId(req.params.courseId, "courseId");
    const course = await getCourseForTeacherOrThrow(courseId, u);
    const { title, code, description } = req.body;
    if (title !== undefined)
        course.title = title.trim();
    if (code !== undefined)
        course.code = code.trim().toUpperCase();
    if (description !== undefined)
        course.description = description.trim();
    await course.save();
    res.json({
        id: String(course._id),
        title: course.title,
        code: course.code,
        description: course.description,
        teacherId: String(course.teacherId),
    });
}));
coursesRouter.delete("/:courseId", requireTeacher, asyncHandler(async (req, res) => {
    const u = req.authUser;
    const courseId = parseObjectId(req.params.courseId, "courseId");
    await getCourseForTeacherOrThrow(courseId, u);
    await Enrollment.deleteMany({ courseId });
    await Grade.deleteMany({ courseId });
    await Attendance.deleteMany({ courseId });
    await Course.deleteOne({ _id: courseId });
    res.status(204).send();
}));
