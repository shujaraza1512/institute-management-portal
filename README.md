# Institute Management Portal

A role-based web portal for an educational institute, with three roles: **Student**, **Teacher**, and **Examination Board (Admin)**.

**Stack:** React (Vite) + Tailwind CSS on the frontend, Node.js + Express on the backend, MySQL via Sequelize for the database.

---

## Project status: Phase 5 — Student Portal ✅

### Roadmap

- [x] **Phase 1 — Architecture & folder structure**
- [x] **Phase 2 — Database schema**
- [x] **Phase 3 — Authentication & RBAC**
- [x] **Phase 4 — Public UI / Home Page**
- [x] **Phase 5 — Student Portal** *(this delivery — see `PHASE_NOTES.md`)*
- [ ] **Phase 6 — Teacher portal** (Upload Results, Upload Lecture Units, Upload Monthly Paper, My Classes)
- [ ] **Phase 7 — Examination Board portal** (Management pages, Approvals, Final Result Publishing, Announcements, Reports)
- [ ] **Phase 8 — Integration, polish, and review**

> **Continuing this project in a new chat:** this coding environment resets between separate conversations. Keep this project in a git repo and upload it back (or share the repo URL again) when you're ready for the next phase, so Claude can build on the actual code instead of starting over. Each phase's `PHASE_NOTES.md` (see project root) documents exactly what changed, so you don't have to rely on chat history to remember.

---

## Folder structure

```
institute-management-portal/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/            # common/, layout/, ui/ — shared building blocks
│   │   ├── constants/              # sidebarLinks.js — per-role nav config
│   │   ├── context/                # AuthContext (stub — real logic in Phase 3)
│   │   ├── hooks/
│   │   ├── layouts/                # DashboardLayout + Student/Teacher/AdminLayout
│   │   ├── pages/
│   │   │   ├── public/             # Home
│   │   │   ├── auth/               # Login
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   └── admin/
│   │   ├── routes/                 # ProtectedRoute (stub)
│   │   ├── services/                # api.js — shared axios instance
│   │   ├── utils/
│   │   ├── App.jsx                 # full route tree
│   │   └── main.jsx
│   └── package.json
├── server/                         # Express backend
│   ├── config/                     # config.js (env settings), db.js (Sequelize/MySQL)
│   ├── controllers/                # empty — filled in per phase
│   ├── middleware/                 # auth.js, roleCheck.js (stubs), errorHandler.js, upload.js
│   ├── models/                     # 12 Sequelize models + index.js loader (Phase 2)
│   ├── routes/                     # index.js — route aggregator + /health check
│   ├── seed/                       # seed.js — sample data for trying the schema out
│   ├── uploads/                    # multer destination for lecture notes/papers
│   ├── app.js                      # Express app + middleware pipeline
│   ├── server.js                   # entry point — connects DB, syncs models, starts listening
│   └── package.json
├── package.json                    # root convenience scripts (optional)
└── README.md
```

**Why this structure:** `client` and `server` are independent npm projects so they can be deployed separately. Inside `server`, routes/controllers/models are split by responsibility rather than by role — a `students` route, for instance, will sit next to `teachers` and `admin` routes rather than being nested under a "student portal" folder, which keeps the API RESTful and avoids duplicating logic three times. On the frontend, one generic `DashboardLayout` is shared by all three portals; each role just supplies its own sidebar links (see `constants/sidebarLinks.js`) and a label, so the sidebar/topbar/shell stay visually and structurally identical across roles instead of drifting apart as three separate implementations.

---

## Database schema (Phase 2)

12 Sequelize models in `server/models/`, loaded and associated automatically by `server/models/index.js` (drop a new model file in that folder and it's picked up automatically — no manual registration needed). A few deliberate departures from a flat one-table-per-spec-entity design, made in the name of normalization and data integrity:

- **`Class`** stores `name` + `section` together (e.g. "10" + "A") as one row, rather than keeping `class`/`section` as separate free-text fields on `Student`. A student's class/section now lives in exactly one place (`Student.classId`).
- **`TeacherAssignment`** is a join table (`teacherId` + `classId` + `subjectId`) representing "this teacher teaches this subject to this class." It backs both **Assign Subjects/Classes** (Teacher Management) and **Assign Teachers** (Class Management) — the same fact, viewed from two admin screens.
- **Uploads are split into two models by behavior, not by spec wording:**
  - `LectureUnit` — notes/PPTs/assignments, visible to students immediately, no approval needed.
  - `TeacherUpload` — result sheets and monthly exam papers (`type: 'result' | 'monthly_paper'`), gated behind Examination Board approval (`status: pending/approved/rejected/returned`), hidden from students until reviewed.
- **`Result`** only ever holds already-approved, student-visible data — there's no "pending" status on this table. A pending submission lives in `TeacherUpload` until approved; only then does a `Result` row get created, which is what makes **Final Result Publishing** a real, distinct action rather than a status flip. `percentage` is a Sequelize `VIRTUAL` field computed from `marks`/`totalMarks` on read, so it can never drift out of sync.
- **`PaperSchedule`** holds only exam metadata (date/time/room) for the student-facing schedule — the actual paper file is a `TeacherUpload` (`type: 'monthly_paper'`), kept separate since one is public info and the other must stay hidden from students.
- Integrity constraints worth knowing about: `Timetable` has unique constraints on `(classId, day, startTime)` **and** `(teacherId, day, startTime)`, so neither a class nor a teacher can be double-booked. `Result` is unique on `(studentId, subjectId, month)`. `Class` is unique on `(name, section)`.

**All 12 models:** `User`, `Student`, `Teacher`, `Subject`, `Class`, `TeacherAssignment`, `Timetable`, `PaperSchedule`, `LectureUnit`, `TeacherUpload`, `Result`, `Announcement`.

**Seeding / trying it out:**

```bash
cd server
cp .env.example .env   # fill in your MySQL credentials
npm install
node seed/seed.js       # drops, recreates, and populates all tables with sample data
```

This was run against a real local MySQL 8 instance while building this phase — `npm install`, the seed script, and a joined query pulling a `Result` through `Student` → `User` and `Subject` were all verified to work, including the computed `percentage` field. One real bug was caught and fixed in the process: MySQL enforces foreign keys during `DROP TABLE`, and Sequelize's `sync({ force: true })` doesn't always drop tables in dependency order for a schema this interconnected — `seed.js` now wraps that step in `SET FOREIGN_KEY_CHECKS = 0/1`.

`server/server.js` now also calls `sequelize.sync()` on startup (creates any missing tables without touching existing data) — fine for this stage, but worth swapping for real Sequelize migrations before this goes to production.

---

## Authentication (Phase 3)

JWT stored in an `httpOnly` cookie rather than `localStorage` — the frontend never touches the token directly, which closes off the most common XSS-based token theft vector. `server/middleware/auth.js` (`protect`) verifies it and loads the current user; `server/middleware/roleCheck.js` (`authorize('admin', ...)`) gates a route to specific roles once `protect` has run. On the frontend, `AuthContext` checks `/api/auth/me` once on load so a page refresh doesn't log anyone out, and `ProtectedRoute` redirects unauthenticated visitors to `/login` and wrong-role visitors to their own dashboard rather than rendering anything sensitive.

There's no self-registration page — accounts are created by the Examination Board (Student/Teacher Management, arriving in Phases 5–7), matching the spec. Until then, use `node seed/seed.js` to create one test account per role. Full details, test credentials, and the exact request/response flow are in `PHASE_NOTES.md`.

---

## Public UI (Phase 4)

The real Home page: `client/src/pages/public/Home.jsx` composes six components from `client/src/components/home/` — `Navbar`, `Hero`, `About`, `Features`, `Announcements`, `Footer`. All copy, stats, feature descriptions, and contact/social details live in one file, `client/src/constants/siteContent.js` — edit that one file to rebrand the whole page instead of hunting through component markup.

The Navbar/Hero read `useAuth()` (unchanged from Phase 3) to show "Go to Dashboard" instead of "Login" for an already-authenticated visitor — this only *reads* existing auth state, nothing about the auth system itself changed. The Announcements section uses static sample data for now, clearly marked in code, pending a real public announcements endpoint in Phase 7.

Full details in `PHASE_NOTES.md`.

---

## Student Portal (Phase 5)

The first fully functional role in the app — every page fetches real data from the database through `/api/students/me/*` endpoints; nothing is hardcoded on the frontend. Every route resolves "the current student" from the logged-in session server-side (`server/middleware/loadStudent.js`) — no endpoint ever accepts a student ID from the client, so there's no way to even attempt requesting someone else's data.

Two small, deliberate schema additions were needed to satisfy requirements the Phase 2 schema didn't cover: a minimal `Attendance` model (for the dashboard's attendance percentage) and a `guardianPhone` column on `Student` (for the Profile page's parent contact field). Both are documented in full, including exactly why, in `PHASE_NOTES.md`.

---

Defined in `client/tailwind.config.js`, so every future page pulls from the same palette instead of ad-hoc colors:

| Token | Value | Use |
|---|---|---|
| `navy-700` | `#1f3a63` | Primary brand blue (buttons, sidebar, headings) |
| `navy-800` | `#162a49` | Sidebar background |
| `sky-500` | `#3b82c4` | Accent — used sparingly (links, active states) |
| `surface` | `#f7f9fc` | Page background (off-white, not stark white) |
| `ink` / `muted` | `#1e293b` / `#64748b` | Primary / secondary text |
| `approve` / `pending` / `reject` | `#2f855a` / `#b7791f` / `#c53030` | Status colors for approvals workflow |

Typography: **Lora** (serif) for headings — gives the portal an institutional, academic feel — paired with **Inter** for body text and UI, which stays highly readable in dense tables and forms. **IBM Plex Mono** is reserved for IDs/codes/timestamps.

---

## Running it locally

Requires Node.js 18+ and a running MySQL server.

```bash
# Backend
cd server
cp .env.example .env    # then fill in your MySQL credentials
npm install
npm run dev              # http://localhost:5000

# Frontend (separate terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

The public Home page (`/`), Login page (`/login`), and the entire Student Portal (`/student/*`) are fully built and backed by real data. Teacher and Admin dashboards (`/teacher`, `/admin`) still render placeholder content confirming navigation, auth, and styling all work correctly — those portals arrive in Phases 6–7.
