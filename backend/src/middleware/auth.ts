import type { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { config } from "../config.js";
import { User } from "../models/User.js";
import { createHash } from "node:crypto";

function resolveRole(email: string): "teacher" | "student" {
  return config.teacherEmails.has(email.toLowerCase()) ? "teacher" : "student";
}

function readRegistrationMarks(meta: Record<string, unknown> | undefined): number | null {
  if (!meta) return null;
  const v = meta.registration_marks;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) return res.status(401).json({ error: "Missing Bearer token" });

  let sub: string;
  let email: string;
  let displayNameFromToken: string;
  let firstFromMeta = "";
  let lastFromMeta = "";
  let registrationMarksFromToken: number | null = null;

  try {
    const issuer = `${config.supabaseUrl}/auth/v1`;
    const jwks = jose.createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
    let payload: jose.JWTPayload;
    try {
      const secret = new TextEncoder().encode(config.supabaseJwtSecret);
      const hs = await jose.jwtVerify(token, secret, { algorithms: ["HS256"] });
      payload = hs.payload;
    } catch {
      // Newer Supabase projects issue asymmetric access tokens (e.g. ES256).
      const remote = await jose.jwtVerify(token, jwks, {
        issuer,
        audience: "authenticated",
        algorithms: ["ES256", "RS256", "EdDSA"],
      });
      payload = remote.payload;
    }
    if (typeof payload.sub !== "string" || !payload.sub) {
      return res.status(401).json({ error: "Invalid token: no sub" });
    }
    sub = payload.sub;
    const rawEmail = payload.email;
    const meta = payload.user_metadata as Record<string, unknown> | undefined;
    const metaEmail =
      typeof meta?.email === "string" && meta.email ? meta.email.toLowerCase() : "";
    if (typeof rawEmail === "string" && rawEmail.trim()) {
      email = rawEmail.toLowerCase();
    } else if (metaEmail) {
      email = metaEmail;
    } else {
      return res.status(401).json({ error: "Invalid token: no email claim" });
    }
    const fromMeta =
      (typeof meta?.full_name === "string" && meta.full_name) ||
      (typeof meta?.name === "string" && meta.name) ||
      (typeof meta?.display_name === "string" && meta.display_name) ||
      "";
    firstFromMeta =
      (typeof meta?.first_name === "string" && meta.first_name.trim()) ||
      (typeof meta?.given_name === "string" && meta.given_name.trim()) ||
      "";
    lastFromMeta =
      (typeof meta?.last_name === "string" && meta.last_name.trim()) ||
      (typeof meta?.family_name === "string" && meta.family_name.trim()) ||
      "";
    registrationMarksFromToken = readRegistrationMarks(meta);
    displayNameFromToken =
      fromMeta.trim() ||
      `${firstFromMeta} ${lastFromMeta}`.trim() ||
      email.split("@")[0] ||
      "User";
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const detail =
        error instanceof Error ? `${error.name}: ${error.message}` : "token verification failed";
      const digest = createHash("sha256").update(token).digest("hex").slice(0, 12);
      console.warn(`[auth] token verify failed token_sha=${digest} detail=${detail}`);
    }
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const roleFromEmail = resolveRole(email);

  let user =
    (await User.findOne({ authId: sub })) ??
    (await User.findOne({ email, archivedAt: null }));

  if (!user) {
    user = await User.create({
      authId: sub,
      email,
      displayName: displayNameFromToken,
      firstName: firstFromMeta,
      lastName: lastFromMeta,
      registrationMarks: registrationMarksFromToken,
      role: roleFromEmail,
    });
  } else {
    if (user.authId && user.authId !== sub) {
      return res.status(409).json({ error: "Email already linked to another account" });
    }
    if (!user.authId) user.authId = sub;
    if (roleFromEmail === "teacher") user.role = "teacher";
    if (!user.displayName?.trim()) user.displayName = displayNameFromToken;
    if (!user.firstName?.trim() && firstFromMeta) user.firstName = firstFromMeta;
    if (!user.lastName?.trim() && lastFromMeta) user.lastName = lastFromMeta;
    if (user.registrationMarks == null && registrationMarksFromToken != null) {
      user.registrationMarks = registrationMarksFromToken;
    }
    await user.save();
  }

  req.authUser = user;
  next();
}

export function requireTeacher(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser) return res.status(401).json({ error: "Unauthorized" });
  if (req.authUser.role !== "teacher") {
    return res.status(403).json({ error: "Teacher role required" });
  }
  next();
}
