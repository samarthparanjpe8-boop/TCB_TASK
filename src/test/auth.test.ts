import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("auth (no database)", () => {
  const app = createApp();

  it("returns 401 without token for /me", async () => {
    const res = await request(app).get("/api/v1/me");
    expect(res.status).toBe(401);
  });

  it("allows health without auth", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
