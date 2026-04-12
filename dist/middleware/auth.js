import * as jose from "jose";
import { config } from "../config.js";
import { User } from "../models/User.js";
function resolveRole(email) {
    return config.teacherEmails.has(email.toLowerCase()) ? "teacher" : "student";
}
export async function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Bearer token" });
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token)
        return res.status(401).json({ error: "Missing Bearer token" });
    let sub;
    let email;
    let displayNameFromToken;
    try {
        const secret = new TextEncoder().encode(config.supabaseJwtSecret);
        const { payload } = await jose.jwtVerify(token, secret, { algorithms: ["HS256"] });
        if (typeof payload.sub !== "string" || !payload.sub) {
            return res.status(401).json({ error: "Invalid token: no sub" });
        }
        sub = payload.sub;
        const e = payload.email;
        if (typeof e !== "string" || !e) {
            return res.status(401).json({ error: "Invalid token: no email claim" });
        }
        email = e.toLowerCase();
        const meta = payload.user_metadata;
        const fromMeta = (typeof meta?.full_name === "string" && meta.full_name) ||
            (typeof meta?.name === "string" && meta.name) ||
            (typeof meta?.display_name === "string" && meta.display_name) ||
            "";
        displayNameFromToken = fromMeta.trim() || email.split("@")[0] || "User";
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
    const roleFromEmail = resolveRole(email);
    let user = (await User.findOne({ authId: sub })) ??
        (await User.findOne({ email, archivedAt: null }));
    if (!user) {
        user = await User.create({
            authId: sub,
            email,
            displayName: displayNameFromToken,
            role: roleFromEmail,
        });
    }
    else {
        if (user.authId && user.authId !== sub) {
            return res.status(409).json({ error: "Email already linked to another account" });
        }
        if (!user.authId)
            user.authId = sub;
        if (roleFromEmail === "teacher")
            user.role = "teacher";
        if (!user.displayName?.trim())
            user.displayName = displayNameFromToken;
        await user.save();
    }
    req.authUser = user;
    next();
}
export function requireTeacher(req, res, next) {
    if (!req.authUser)
        return res.status(401).json({ error: "Unauthorized" });
    if (req.authUser.role !== "teacher") {
        return res.status(403).json({ error: "Teacher role required" });
    }
    next();
}
