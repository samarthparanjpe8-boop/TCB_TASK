import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { User } from "../models/User.js";
import { config } from "../config.js";
import {
  goTrueErrorMessage,
  goTruePasswordGrant,
  goTrueRecover,
  goTrueSignup,
  goTrueUpdatePassword,
} from "../services/supabaseGoTrue.js";

function resolveRole(email: string): "teacher" | "student" {
  return config.teacherEmails.has(email.toLowerCase()) ? "teacher" : "student";
}

export const authRouter = Router();

authRouter.post(
  "/auth/sign-in",
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { res: supRes, data } = await goTruePasswordGrant(email, password);
    if (!supRes.ok || !data.access_token) {
      return res.status(401).json({
        error: goTrueErrorMessage(data, "Invalid email or password"),
      });
    }

    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type ?? "bearer",
    });
  })
);

authRouter.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const firstName = typeof req.body?.firstName === "string" ? req.body.firstName.trim() : "";
    const lastName = typeof req.body?.lastName === "string" ? req.body.lastName.trim() : "";
    const requestedRole =
      req.body?.role === "teacher" || req.body?.role === "student" ? req.body.role : "student";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First name and last name are required" });
    }

    const displayName = `${firstName} ${lastName}`.trim();
    const { res: supRes, data } = await goTrueSignup({
      email,
      password,
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: displayName,
      },
    });

    if (!supRes.ok || !data.access_token) {
      const status = supRes.status === 422 || supRes.status === 400 ? supRes.status : 400;
      return res.status(status).json({
        error: goTrueErrorMessage(
          data,
          "Registration failed. The account may already exist, or email confirmation may be required in Supabase."
        ),
      });
    }

    const authId = data.user?.id;
    if (!authId) {
      return res.status(502).json({ error: "Auth provider returned no user id" });
    }

    const role = requestedRole === "teacher" ? "teacher" : resolveRole(email);
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          authId,
          email,
          displayName,
          firstName,
          lastName,
          role,
          archivedAt: null,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type ?? "bearer",
    });
  })
);

authRouter.post(
  "/auth/forgot-password",
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const redirectTo =
      typeof req.body?.redirectTo === "string" && req.body.redirectTo.trim()
        ? req.body.redirectTo.trim()
        : undefined;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const { res: supRes, data } = await goTrueRecover(email, redirectTo);
    if (!supRes.ok) {
      return res.status(400).json({
        error: goTrueErrorMessage(data, "Unable to send password reset email"),
      });
    }
    res.json({ ok: true, message: "If the account exists, a password reset email was sent." });
  })
);

authRouter.post(
  "/auth/reset-password",
  asyncHandler(async (req, res) => {
    const accessToken =
      typeof req.body?.accessToken === "string" ? req.body.accessToken.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!accessToken || !password) {
      return res.status(400).json({ error: "accessToken and password are required" });
    }
    const { res: supRes, data } = await goTrueUpdatePassword(accessToken, password);
    if (!supRes.ok) {
      return res.status(400).json({
        error: goTrueErrorMessage(data, "Password reset failed"),
      });
    }
    res.json({ ok: true, message: "Password updated successfully" });
  })
);
