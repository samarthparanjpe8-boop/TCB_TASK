import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { requireAuth } from "./middleware/auth.js";
import { asyncHandler, errorHandler } from "./lib/asyncHandler.js";
import { meRouter } from "./routes/me.js";
import { studentsRouter } from "./routes/students.js";
import { coursesRouter } from "./routes/courses.js";
import { enrollmentsRouter } from "./routes/enrollments.js";
import { gradesRouter } from "./routes/grades.js";
import { attendanceRouter } from "./routes/attendance.js";
export function createApp() {
    const app = express();
    app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin, credentials: true }));
    app.use(express.json());
    app.get("/api/v1/health", asyncHandler(async (_req, res) => {
        res.json({ ok: true, service: "classroom-api" });
    }));
    const v1 = express.Router();
    v1.use(requireAuth);
    v1.use(meRouter);
    v1.use("/students", studentsRouter);
    v1.use("/courses", coursesRouter);
    v1.use("/courses/:courseId/enrollments", enrollmentsRouter);
    v1.use("/courses/:courseId/grades", gradesRouter);
    v1.use("/courses/:courseId/attendance", attendanceRouter);
    app.use("/api/v1", v1);
    app.use(errorHandler);
    return app;
}
