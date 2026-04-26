import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireTeacher } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { parseObjectId } from "../lib/mongoId.js";
import { HttpError } from "../lib/httpErrors.js";

export const studentsRouter = Router();

studentsRouter.use(requireTeacher);

studentsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const list = await User.find({ role: "student", archivedAt: null }).sort({ displayName: 1 }).lean();
    res.json(
      list.map((u) => ({
        id: String(u._id),
        authId: u.authId ?? null,
        email: u.email,
        displayName: u.displayName,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }))
    );
  })
);

studentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email, displayName } = req.body as { email?: string; displayName?: string };
    if (!email?.trim() || !displayName?.trim()) {
      throw new HttpError(400, "email and displayName are required");
    }
    const em = email.trim().toLowerCase();
    const existing = await User.findOne({ email: em });
    if (existing && !existing.archivedAt) {
      if (existing.role === "teacher") {
        throw new HttpError(409, "This email belongs to a teacher account.");
      }
      return res.status(200).json({
        id: String(existing._id),
        authId: existing.authId ?? null,
        email: existing.email,
        displayName: existing.displayName,
      });
    }
    if (existing && existing.archivedAt) {
      existing.archivedAt = null;
      existing.displayName = displayName.trim();
      existing.role = "student";
      await existing.save();
      return res.status(201).json({
        id: String(existing._id),
        authId: existing.authId ?? null,
        email: existing.email,
        displayName: existing.displayName,
      });
    }
    const u = await User.create({
      email: em,
      displayName: displayName.trim(),
      role: "student",
    });
    res.status(201).json({
      id: String(u._id),
      authId: u.authId ?? null,
      email: u.email,
      displayName: u.displayName,
    });
  })
);

studentsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseObjectId(req.params.id, "student id");
    const { displayName } = req.body as { displayName?: string };
    if (!displayName?.trim()) throw new HttpError(400, "displayName is required");
    const u = await User.findOne({ _id: id, role: "student" });
    if (!u) throw new HttpError(404, "Student not found");
    u.displayName = displayName.trim();
    await u.save();
    res.json({
      id: String(u._id),
      authId: u.authId ?? null,
      email: u.email,
      displayName: u.displayName,
    });
  })
);

studentsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseObjectId(req.params.id, "student id");
    const u = await User.findOne({ _id: id, role: "student" });
    if (!u) throw new HttpError(404, "Student not found");
    u.archivedAt = new Date();
    await u.save();
    res.status(204).send();
  })
);
