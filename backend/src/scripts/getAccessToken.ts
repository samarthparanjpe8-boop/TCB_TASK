import "dotenv/config";

const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const anonKey = process.env.SUPABASE_ANON_KEY;
const email =
  process.env.TEACHER_EMAIL?.trim() ??
  process.env.AUTH_EMAIL?.trim() ??
  process.argv[2]?.trim();
const password =
  process.env.TEACHER_PASSWORD ?? process.env.AUTH_PASSWORD ?? process.argv[3];

if (!baseUrl || !anonKey || !email || !password) {
  console.error(
    "Set SUPABASE_URL, SUPABASE_ANON_KEY, TEACHER_EMAIL, and TEACHER_PASSWORD in .env,",
  );
  console.error("or run: npm run get-token -- <email> <password>");
  process.exit(1);
}

const res = await fetch(
  `${baseUrl}/auth/v1/token?grant_type=password`,
  {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  },
);

const data = (await res.json()) as {
  access_token?: string;
  error_description?: string;
  msg?: string;
};

if (!res.ok) {
  console.error(data.error_description ?? data.msg ?? `HTTP ${res.status}`);
  process.exit(1);
}

if (!data.access_token) {
  console.error("Response had no access_token");
  process.exit(1);
}

process.stdout.write(`${data.access_token}\n`);
