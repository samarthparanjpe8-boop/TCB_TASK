# ClassroomIQ Frontend

A React + TypeScript frontend for the **ClassroomIQ** classroom management system, built with Vite.

---

## 🚀 Running Without a Backend (Demo Mode)

The frontend includes a **Demo Mode** that uses mock data so you can test every feature without running MongoDB or the backend server.

### Prerequisites
- Node.js 18+

### Quick Start

```bash
cd TCB_TASK/frontend
npm install
```

Make sure `.env` contains (already set by default):
```env
VITE_DEMO_MODE=true
```

Then start the dev server:
```bash
npm run dev
# Opens at http://localhost:5173
```

---

## 🔐 Signing In (Demo Mode)

Go to **http://localhost:5173/sign-in**

- Use **any email address**
- Use **any password with 4+ characters**

**Suggested credentials:**
```
Email:    admin@school.edu
Password: admin123
```

---

## 🔬 Frontend Test Checklist

### 1. Landing Page (`/`)
- [ ] Hero section renders with correct text
- [ ] "Grade &" and "Course" text shows in purple
- [ ] Quick Overview card shows 6 Students / 5 Courses / 86% Avg
- [ ] **Start Managing** and **Explore Features** buttons navigate to Sign In
- [ ] Theme toggle (☀/🌙) in top-right switches light/dark mode

### 2. Sign In Page (`/sign-in`)
- [ ] Demo Mode hint box is visible with suggested credentials
- [ ] Email field is pre-filled with `admin@school.edu`
- [ ] Password visibility toggle works (👁 icon)
- [ ] Short password (<4 chars) shows error message
- [ ] Valid credentials → redirects to `/app`
- [ ] **Back to home** link returns to landing page

### 3. Dashboard (`/app`)
- [ ] 4 stat cards: Total Students (6), Total Courses (5), Grades Recorded (9), Class Average (86%)
- [ ] Grade Distribution donut chart renders in colors
- [ ] Course Enrollment bar chart shows 5 courses
- [ ] Top Performers list shows Clara Thompson, Emily Nguyen, Alice Johnson at 91–92%
- [ ] Needs Attention panel shown (Frank Wilson, 73%)
- [ ] All sidebar links visible: Dashboard, Students, Courses, Grades, Academic Records

### 4. Students Page (`/app/students`)
- [ ] Table loads all 6 mock students
- [ ] Search box filters students by name or email
- [ ] **+ Add Student** opens a modal form
- [ ] Adding a student (valid name + email) → appears in table + success toast
- [ ] **✏ Edit** opens edit modal → saving updates the name
- [ ] **🗑 Remove** opens confirm modal → confirming removes the row + info toast

### 5. Courses Page (`/app/courses`)
- [ ] 5 course cards display with code badges
- [ ] **+ New Course** modal opens with title/code/description fields
- [ ] Adding a course → card appears in grid
- [ ] Edit icon → modal updates course title
- [ ] Delete icon → confirm → card removed

### 6. Grades Page (`/app/grades`)
- [ ] All 9 grade records show in table
- [ ] Course dropdown filter ("All Courses" and individual courses work)
- [ ] Each row shows Student, Course code, Assignment, Score, Letter Grade badge
- [ ] **+ Record Grade** → modal with course/student/assignment/score fields
- [ ] Edit / Delete work as expected

### 7. Academic Records Page (`/app/academic-records`)
- [ ] Student filter dropdown
- [ ] Each student card shows overall average percentage
- [ ] Grade table with progress bars visible per assignment
- [ ] Filtering by individual student narrows the view

### 8. Theme Switcher (Sidebar)
- [ ] Light / System / Dark buttons at bottom of sidebar
- [ ] Switching persists after page reload (stored in localStorage)

### 9. Sign Out
- [ ] Sidebar bottom has email + sign-out button
- [ ] Clicking → clears session → redirects to `/`
- [ ] Trying to visit `/app` redirects back to `/sign-in`

---

## 🔗 Connecting to the Real Backend

1. **Copy and configure the backend `.env`:**
   ```bash
   cd TCB_TASK/backend
   cp .env.example .env
   # Fill in: MONGODB_URI, SUPABASE_URL, SUPABASE_JWT_SECRET, TEACHER_EMAILS
   ```

2. **Start the backend:**
   ```bash
   npm run dev   # Runs on http://localhost:4000
   ```

3. **Update frontend `.env`:**
   ```env
   VITE_DEMO_MODE=false
   ```

4. **Start the frontend:**
   ```bash
   cd TCB_TASK/frontend
   npm run dev   # http://localhost:5173
   ```

Now sign in with real **Supabase** credentials. The frontend will call `/api/v1/*` which Vite proxies to `http://localhost:4000`.

> **Note:** The authenticated user's email must be in `TEACHER_EMAILS` in the backend `.env` to access teacher-only routes (manage students, courses, grades).

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts          # Axios instance with Bearer auth
│   │   └── mockData.ts     # Mock data for demo mode
│   ├── contexts/
│   │   ├── AuthContext.tsx # Login / logout / JWT storage
│   │   ├── ThemeContext.tsx # Light/dark/system theme
│   │   └── ToastContext.tsx # Toast notifications
│   ├── components/
│   │   ├── AppLayout.tsx   # Sidebar + main layout
│   │   ├── Sidebar.tsx     # Navigation + theme switcher
│   │   ├── StatCard.tsx    # Metric card
│   │   └── Modal.tsx       # Generic modal
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── SignInPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── StudentsPage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── GradesPage.tsx
│   │   └── AcademicRecordsPage.tsx
│   ├── types/index.ts      # TypeScript interfaces
│   ├── App.tsx             # Router with protected routes
│   └── main.tsx
├── .env                    # VITE_DEMO_MODE=true (default)
└── vite.config.ts          # Proxy /api → localhost:4000
```

---

## 🛠 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
