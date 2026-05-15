# StudentIQ — Deploy Frontend + Backend (No Railway)

Recommended stack:

| Part | Host | Why |
|------|------|-----|
| **Frontend** | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Static Vite build, free tier, SPA routing |
| **Backend** | [Render](https://render.com) or [Fly.io](https://fly.io) | Long-running Node/Express + MongoDB |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Free cluster |
| **Auth** | [Supabase](https://supabase.com) | Sign-in, JWT, password reset |

---

## Before you deploy (local check)

Run these so you catch errors before pushing:

```bash
# Backend
cd backend
npm install
npm run build
npm start
# In another terminal:
curl http://localhost:4000/api/v1/health
# Expected: {"ok":true,"service":"classroom-api"}

# Frontend
cd frontend
npm install
npm run build
npm run preview
# Open http://localhost:4173
```

---

## Step 1 — MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. **Database Access** → create a user with password
3. **Network Access** → add `0.0.0.0/0` (or your host’s IP range)
4. **Connect** → copy the connection string, e.g.  
   `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/classroom?retryWrites=true&w=majority`

---

## Step 2 — Supabase

1. Create a project at https://supabase.com
2. **Settings → API** copy:
   - Project URL → `SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY`
   - JWT Secret → `SUPABASE_JWT_SECRET`
3. **Authentication → Providers** → enable Email
4. **Authentication → URL Configuration** (after you know your frontend URL):
   - **Site URL**: `https://YOUR-FRONTEND.vercel.app` (or Render static URL)
   - **Redirect URLs**: add  
     `https://YOUR-FRONTEND.vercel.app/**`  
     `https://YOUR-FRONTEND.vercel.app/reset-password`

---

## Step 3 — Deploy backend (Render)

1. Push this repo to GitHub
2. https://dashboard.render.com → **New +** → **Web Service**
3. Connect the repo
4. Settings:

| Field | Value |
|-------|--------|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Instance type | Free (or paid for always-on) |

5. **Environment variables** (required):

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://YOUR-FRONTEND.vercel.app
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
BACKEND_URL=https://YOUR-BACKEND.onrender.com
TEACHER_EMAILS=teacher@school.com,you@example.com
```

Optional (password reset emails):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

6. Deploy and copy your service URL, e.g. `https://classroom-backend.onrender.com`

7. Verify:

```bash
curl https://YOUR-BACKEND.onrender.com/api/v1/health
```

**Important:** `CORS_ORIGIN` must match the frontend URL **exactly** (no trailing slash):  
`https://your-app.vercel.app`

### Alternative: Fly.io backend

```bash
cd backend
fly launch          # follow prompts, app name e.g. classroom-api
fly secrets set MONGODB_URI="..." SUPABASE_URL="..." SUPABASE_ANON_KEY="..." SUPABASE_JWT_SECRET="..." CORS_ORIGIN="https://your-frontend.vercel.app" TEACHER_EMAILS="you@example.com"
fly deploy
```

Use `https://classroom-api.fly.dev` as `BACKEND_URL` / `VITE_API_BASE_URL` base.

---

## Step 4 — Deploy frontend (Vercel)

1. https://vercel.com → **Add New Project** → import GitHub repo
2. Settings:

| Field | Value |
|-------|--------|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. **Environment variables** (Production):

```env
VITE_DEMO_MODE=false
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api/v1
```

4. Deploy

5. Update backend `CORS_ORIGIN` and Supabase redirect URLs to your real Vercel URL, then **redeploy backend** if you changed CORS.

`frontend/vercel.json` already rewrites all routes to `index.html` for React Router.

### Alternative: Netlify

- Build: `npm run build` (base directory `frontend`)
- Publish: `frontend/dist`
- Add same `VITE_*` env vars
- Add redirect: `/* /index.html 200`

---

## Step 5 — Deploy both on Render (blueprint)

If you prefer one platform for frontend + backend:

1. Render → **New +** → **Blueprint**
2. Connect repo (uses root `render.yaml`)
3. Set secrets when prompted:
   - `MONGODB_URI`, `SUPABASE_*`, `SMTP_*`
   - `FRONTEND_URL` = your Render static site URL (after first deploy, or estimate)
   - `CORS_ORIGIN` = same as `FRONTEND_URL`
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND.onrender.com/api/v1`

4. After backend is live, set `VITE_API_BASE_URL` on the static site and redeploy frontend.

---

## Post-deploy checklist

- [ ] `curl https://BACKEND/api/v1/health` → `ok: true`
- [ ] Open frontend `/sign-in` — no CORS errors in browser DevTools → Network
- [ ] API calls go to `https://BACKEND.../api/v1/...` (not `localhost`)
- [ ] Register / sign-in works
- [ ] `/api/v1/me` returns 200 after login
- [ ] Teacher email in `TEACHER_EMAILS` gets teacher role

---

## Common errors

| Symptom | Fix |
|---------|-----|
| CORS blocked | Set `CORS_ORIGIN` to exact frontend origin (https, no trailing `/`) |
| 401 on `/me` | Wrong `SUPABASE_JWT_SECRET` for this Supabase project |
| Frontend calls `/api/v1` on Vercel domain | Set `VITE_API_BASE_URL` and redeploy frontend |
| `Missing required env: MONGODB_URI` | Add env vars on backend host, redeploy |
| Render free backend sleeps | First request slow; upgrade or use Fly.io |
| Password reset fails | Set SMTP vars; add redirect URL in Supabase |
| Build fails on Vercel | Run `cd frontend && npm run build` locally first |

---

## Environment variable reference

### Backend (`backend/.env`)

```env
MONGODB_URI=
PORT=4000
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
TEACHER_EMAILS=
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:4000
```

### Frontend (`frontend/.env`)

```env
VITE_DEMO_MODE=false
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Local dev: keep `VITE_DEMO_MODE=true` to skip real auth, or point `VITE_API_BASE_URL` at local backend.

---

## Quick URLs mental model

| Environment | Frontend | Backend API |
|-------------|----------|-------------|
| Local | http://localhost:5173 | http://localhost:4000/api/v1 |
| Production | https://your-app.vercel.app | https://your-api.onrender.com/api/v1 |
