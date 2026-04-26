# StudentIQ Deployment Guide (Vercel + API Host)

This guide shows the **recommended production setup** for this repo:

- **Frontend (`frontend/`)** on **Vercel**
- **Backend (`backend/`)** on a Node host (Render/Railway/Fly.io)
- **MongoDB Atlas** for database
- **Supabase** for auth

This is the most stable option for the current codebase.

---

## 1) Architecture

- `app.yourdomain.com` -> Vercel (React/Vite frontend)
- `api.yourdomain.com` -> Backend host (Express API)

Why this setup:
- Vercel is excellent for static frontend hosting.
- Express + Mongo workloads are simpler on a persistent Node runtime.

---

## 2) Prerequisites

- GitHub repo for this project
- Vercel account
- Backend host account (Render/Railway/Fly.io)
- MongoDB Atlas cluster + connection string
- Supabase project (URL, anon key, JWT secret)

---

## 3) Deploy Backend First

Deploy `backend/` to Render/Railway/Fly with:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Root directory: `backend`

Set backend environment variables:

```env
MONGODB_URI=<your_mongodb_uri>
PORT=4000
CORS_ORIGIN=https://app.yourdomain.com

SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_JWT_SECRET=<your_supabase_jwt_secret>

TEACHER_EMAILS=teacher1@school.com,teacher2@school.com
```

After deploy, verify:

```bash
curl -sS https://api.yourdomain.com/api/v1/health
```

Expected:

```json
{"ok":true,"service":"classroom-api"}
```

---

## 4) Update Frontend API Base URL Support

In `frontend/src/lib/api.ts`, ensure `baseURL` can use a deployed API URL:

```ts
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
});
```

This keeps local dev working (`/api/v1` via Vite proxy) and supports production API URL.

---

## 5) Deploy Frontend to Vercel

In Vercel:

- Import repository
- Set **Root Directory** to `frontend`
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

Set frontend environment variables:

```env
VITE_DEMO_MODE=false
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

Deploy and open your Vercel URL.

---

## 6) Configure Domains (Optional but Recommended)

- Point `app.yourdomain.com` to Vercel project
- Point `api.yourdomain.com` to backend host
- Keep `CORS_ORIGIN` exactly equal to your app URL:
  - `https://app.yourdomain.com`

---

## 7) Post-Deploy Verification Checklist

1. Open `https://app.yourdomain.com/sign-in`
2. Register a new user (or login with existing Supabase user)
3. Confirm browser network calls go to:
   - `https://api.yourdomain.com/api/v1/...`
4. Confirm `/api/v1/me` returns 200 after login
5. Confirm teacher-only routes work for emails listed in `TEACHER_EMAILS`
6. Confirm student role gets expected 403 for teacher-only actions

---

## 8) Common Issues

### CORS errors
- `CORS_ORIGIN` does not match exact frontend origin.

### Login works but `/me` returns 401
- `SUPABASE_JWT_SECRET` is wrong for the Supabase project.

### Frontend still calls relative `/api/v1` in production
- `VITE_API_BASE_URL` missing or frontend not redeployed after env update.

### Generic auth failures
- Supabase user does not exist, wrong password, or email confirmation/rate limits.

---

## 9) Optional: Full Vercel (Frontend + Backend)

Possible, but requires converting Express backend to Vercel serverless functions and setting rewrites/routes. For this repo, split hosting is usually faster to stabilize and easier to maintain.

---

## 10) Quick Local-to-Prod Mental Model

- Local frontend: `http://localhost:5173` (proxy to local backend)
- Prod frontend: `https://app.yourdomain.com` (calls deployed API URL)
- Local backend: `http://127.0.0.1:4000`
- Prod backend: `https://api.yourdomain.com`

