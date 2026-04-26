import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required("MONGODB_URI"),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  supabaseUrl: required("SUPABASE_URL").replace(/\/$/, ""),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseJwtSecret: required("SUPABASE_JWT_SECRET"),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:4000",
  teacherEmails: new Set(
    (process.env.TEACHER_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  ),
};
