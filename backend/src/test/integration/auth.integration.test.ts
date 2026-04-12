import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../../app.js";
import { signTestAccessToken } from "../jwt.js";

const secret = process.env.SUPABASE_JWT_SECRET!;

const testUri =
  process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017/classroom_api_test";

describe("auth and RBAC (integration)", () => {
  const app = createApp();

  beforeAll(async () => {
    await mongoose.connect(testUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    const cols = await mongoose.connection.db!.collections();
    await Promise.all(cols.map((c) => c.deleteMany({})));
  });

  it("forbids student from teacher-only route", async () => {
    const token = await signTestAccessToken("stu-1", "student@test.com", secret);
    const res = await request(app)
      .post("/api/v1/students")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "x@y.com", displayName: "X" });
    expect(res.status).toBe(403);
  });

  it("allows teacher to create a student profile", async () => {
    const token = await signTestAccessToken("tea-1", "teacher@test.com", secret);
    const res = await request(app)
      .post("/api/v1/students")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "newstudent@test.com", displayName: "New Student" });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe("newstudent@test.com");
  });
});
