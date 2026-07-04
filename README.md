# Institute Management Portal

A role-based web portal for an educational institute, with three roles: **Student**, **Teacher**, and **Examination Board (Admin)**.

**Stack:** React (Vite) + Tailwind CSS on the frontend, Node.js + Express on the backend, MySQL via Sequelize for the database.

---

## Project status: Phase 2 — Database schema ✅

### Roadmap

- [x] **Phase 1 — Architecture & folder structure**
- [x] **Phase 2 — Database schema** *(this delivery)*
- [ ] **Phase 3 — Authentication & RBAC** (login, JWT/session handling, `protect` + `authorize` middleware, real `ProtectedRoute` + `AuthContext`)
- [ ] **Phase 4 — Public pages** (Home, Login — full designs)
- [ ] **Phase 5 — Student portal** (Results, Progress, Timetable, Paper Schedule, Profile)
- [ ] **Phase 6 — Teacher portal** (Upload Results, Upload Lecture Units, Upload Monthly Paper, My Classes)
- [ ] **Phase 7 — Examination Board portal** (Management pages, Approvals, Final Result Publishing, Announcements, Reports)
- [ ] **Phase 8 — Integration, polish, and review**

> **Continuing this project in a new chat:** this coding environment resets between separate conversations. Keep this project in a git repo and upload it back (or share the repo URL again) when you're ready for the next phase, so Claude can build on the actual code instead of starting over.

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

## Design tokens (blue & white theme)

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

There's nothing to log into yet — `/login` and every dashboard route render as placeholders confirming navigation and styling work. Real functionality is layered in over the next phases.
