# Classroom API — backend

## Prerequisites

- **Node.js** (compatible with this package’s engines if specified)
- **npm**
- **MongoDB** running locally (or a reachable URI) for:
  - `npm run dev` / `npm start`
  - `npm run test:integration`
- **Supabase project** (for real JWTs when hitting a running server): URL and **JWT secret** from the Supabase dashboard (API settings). Optional: anon key + user email/password for `get-token`.

## 1. Install dependencies

From the repo root:

```bash
cd backend
npm install
```

## 2. Environment variables

Copy the example env file and edit it:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string (required to **start the server** or run **`promote-teacher`**) |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Allowed browser origin (e.g. frontend dev server) |
| `SUPABASE_URL` | Supabase project URL (required to **start the server**) |
| `SUPABASE_JWT_SECRET` | JWT secret used to verify Bearer tokens (must match tokens you send) |
| `TEACHER_EMAILS` | Comma-separated emails treated as **teachers** on first authenticated request |
| `SUPABASE_ANON_KEY` | Only for `npm run get-token` (dev convenience; not required by the API process itself) |
| `SUPABASE_ALLOW_INSECURE` | Set to `1` to allow local self-signed HTTPS certs when `SUPABASE_URL` uses `https://localhost` |
| `TEACHER_EMAIL` / `TEACHER_PASSWORD` | Optional defaults for `get-token` |

For **automated tests**, `src/test/setup.ts` sets safe defaults when variables are missing, so you often do **not** need a full `.env` for `npm test` alone.

Optional for integration tests:

- `TEST_MONGODB_URI` — overrides default `mongodb://127.0.0.1:27017/classroom_api_test`

## 3. Automated tests (Vitest)

All commands below assume your shell’s current directory is `backend`.

### 3a. Unit / fast tests (no MongoDB required)

These run everything **except** `src/test/integration/**`:

```bash
npm test
```

Expect checks such as: `GET /api/v1/me` without a token returns **401**, and `GET /api/v1/health` returns **200** with `{ ok: true }`.

### 3b. Watch mode (while developing)

```bash
npm run test:watch
```

Vitest will re-run tests when files change.

### 3c. Integration tests (MongoDB required)

Start MongoDB (or point `TEST_MONGODB_URI` at a dedicated test database), then:

```bash
npm run test:integration
```

These tests connect to Mongo, clear collections between cases, and exercise auth/RBAC (e.g. student **403** vs teacher **201** on teacher-only routes). They use the JWT secret from the environment (with a default provided by the test setup if unset).

**If integration tests fail to connect:** verify Mongo is listening on the URI you use (default `127.0.0.1:27017`).

## 4. Run the API locally (manual / browser / curl)

1. Ensure `.env` has valid `MONGODB_URI`, `SUPABASE_URL`, and `SUPABASE_JWT_SECRET`.
2. Start MongoDB if you use a local URI.
3. Start the dev server:

```bash
npm run dev
```

You should see a log like: `classroom-api listening on http://127.0.0.1:4000` (or your `PORT`).

### Quick checks without signing in

- **Health (no auth):** `GET http://127.0.0.1:4000/api/v1/health`

### Authenticated routes

Routes under `/api/v1` (except health, which is mounted outside the auth router) expect:

```http
Authorization: Bearer <access_token>
```

The token must be an HS256 JWT verifiable with your `SUPABASE_JWT_SECRET`, and include `sub` and `email` claims (as Supabase access tokens do).

For `POST /api/v1/auth/register`, send:

- `email`, `password`, `firstName`, `lastName`
- optional `role` (`student` or `teacher`)

Teacher registration is allowed only when the email is listed in `TEACHER_EMAILS`; otherwise registration returns `403`.

### Get a real access token (Supabase password grant)

In `.env`, set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and either `TEACHER_EMAIL` + `TEACHER_PASSWORD` or pass email/password on the CLI:

```bash
npm run get-token -- user@example.com 'your-password'
```

The script prints the `access_token` to stdout (one line). Use that value in `Authorization: Bearer ...`.

**Note:** Password grant must be enabled in your Supabase Auth settings; use only for local/dev.

### Example: call `/me` with a token

```bash
TOKEN="<paste access_token here>"
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:4000/api/v1/me
```

If the user’s email is listed in `TEACHER_EMAILS`, the first successful auth can upsert them as a **teacher**.

## 5. Utility: promote a user to teacher

After a user has hit the API at least once (so a `User` exists), you can promote by email:

```bash
npm run promote-teacher -- someone@example.com
```

Requires the same `MONGODB_URI` (and other config) as the running app.

## 6. Production-style run

```bash
npm run build
npm start
```

Uses `node dist/index.js`; ensure `.env` (or environment) is set on the host.

## Script summary

| Command | Purpose |
|---------|---------|
| `npm test` | Vitest, excludes integration |
| `npm run test:integration` | Integration tests (needs Mongo) |
| `npm run test:watch` | Vitest watch |
| `npm run dev` | Dev server with reload |
| `npm run get-token` | Print Supabase access token (dev) |
| `npm run promote-teacher` | Set a user’s role to teacher in DB |
