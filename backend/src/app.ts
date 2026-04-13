import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { requireAuth } from "./middleware/auth.js";
import { asyncHandler, errorHandler } from "./lib/asyncHandler.js";
import { authRouter } from "./routes/auth.js";
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

  app.get(
    "/api/v1/health",
    asyncHandler(async (_req, res) => {
      res.json({ ok: true, service: "classroom-api" });
    })
  );

  const v1Public = express.Router();
  v1Public.use(authRouter);

  const v1Protected = express.Router();
  v1Protected.use(requireAuth);
  v1Protected.use(meRouter);
  v1Protected.use("/students", studentsRouter);
  v1Protected.use("/courses", coursesRouter);
  v1Protected.use("/courses/:courseId/enrollments", enrollmentsRouter);
  v1Protected.use("/courses/:courseId/grades", gradesRouter);
  v1Protected.use("/courses/:courseId/attendance", attendanceRouter);

  app.use("/api/v1", v1Public);
  app.use("/api/v1", v1Protected);
  app.use(errorHandler);
  return app;
}
