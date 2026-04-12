import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";

export const meRouter = Router();

meRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const u = req.authUser!;
    res.json({
      id: String(u._id),
      authId: u.authId ?? null,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      archivedAt: u.archivedAt,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    });
  })
);
