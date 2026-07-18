# Institute Management Portal

A role-based web portal for an educational institute, with three roles: **Student**, **Teacher**, and **Examination Board (Admin)**.

**Stack:** React (Vite) + Tailwind CSS on the frontend, Node.js + Express on the backend, MySQL via Sequelize for the database.

---

## Project status: Phase 8 — Final Polish & Design System ✅

### Roadmap

- [x] **Phase 1 — Architecture & folder structure**
- [x] **Phase 2 — Database schema**
- [x] **Phase 3 — Authentication & RBAC**
- [x] **Phase 4 — Public UI / Home Page**
- [x] **Phase 5 — Student Portal**
- [x] **Phase 6 — Teacher Portal**
- [x] **Phase 7 — Examination Board (Admin) Portal**
- [x] **Phase 7.5 — Functional Completion**
- [x] **Phase 7.5 — Teacher Result Workflow Fix**
- [x] **Phase 8 — Final Polish, UI/UX, Performance & Project Refinement** *(this delivery — see `PHASE_NOTES.md`)*

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

## Teacher Portal (Phase 6)

A significant redesign from the original file-upload-based spec: the detailed Phase 6 requirements replaced "upload a results file" with direct per-student result entry (add/edit/delete, grade and percentage computed automatically), and split "uploads" into two distinct entities — **Assignments** (title, description, due date, optional attachment) and **Lecture Materials** (file or external link). Both get full CRUD, scoped so a teacher only ever touches their own classes/subjects and their own records — enforced server-side, not just hidden in the UI.

This required real schema changes on top of Phase 2/5: `Result` gained a `status` (pending/approved/rejected) and `createdBy` field — student-facing queries (Phase 5) now only ever read `status: 'approved'` rows, which is what keeps the original "teacher cannot publish directly" rule intact even though results are entered directly now rather than uploaded as a file. A new `Assignment` model was added, and `LectureUnit` was expanded with `description` and `externalLink`. Full rationale in `PHASE_NOTES.md`.

Uploaded files (assignment attachments, lecture materials) are served through an authenticated, class-scoped download route rather than a public static folder — the previous blanket `express.static('uploads')` mount would have let anyone with a URL download a file with no login at all, which doesn't hold up once real uploads exist.

---

## Examination Board / Admin Portal (Phase 7)

Full institute-wide management: Result Approval (the central workflow — nothing a teacher enters is visible to a student until approved here), Student Management, Teacher Management (with a subject/class assignment checklist), Class Management, Subject Management, Announcement Management (with publish/expiry scheduling), Timetable Management (with double-booking prevention), Paper Schedule Management, and a dedicated per-student detailed report with charts and a print view.

Unlike Phases 5/6, admin routes have no `loadX` scoping middleware — by spec, the Examination Board has full institute-wide access, not access scoped to "its own" records.

Six schema additions were needed to support fields the detailed spec asked for that didn't exist yet (`guardianName`/`admissionDate` on Student, `qualification` on Teacher, `classTeacherId` on Class, `examName` on PaperSchedule, `publishAt`/`expiryDate` on Announcement, `reviewedBy`/`reviewedAt`/`rejectionReason` on Result), plus one genuine bug fix carried over from Phase 2: deleting a Student/Teacher was throwing a foreign-key error, because MySQL/Sequelize only generates an `ON DELETE CASCADE` constraint from the side that owns the foreign key column, not the side it was set on. Full detail in `PHASE_NOTES.md`.

---

## Phase 7.5 — Functional Completion

Closed four gaps left after Phase 7: the Student Portal had no page for Assignments or Lecture Materials even though the backend endpoints existed since Phase 6; the Teacher Portal's Results page showed a status badge but never the rejection reason behind it; the Examination Board's Student Report was missing teacher remarks, approval history, and a day-by-day attendance log; and the Student Dashboard didn't surface recent assignments/materials. All four are now real, API-backed pages/sections — no dummy data anywhere.

The full **Teacher → Examination Board → Student** result lifecycle was verified end to end, including the resubmit path: a teacher submits a result (pending) → admin rejects it with a reason → teacher sees the reason and edits it (status returns to pending automatically) → admin approves it → the student sees it for the first time, with the final edited marks. Full test transcript in `PHASE_NOTES.md`.

---

## Phase 7.5 — Teacher Result Workflow Fix

Replaced the Teacher Portal's class/subject/month roster browser with the workflow the spec actually asked for: a **Result Submission Form** (pick a student — class, roll number, and Institute ID auto-fill — pick a subject, exam type, month, marks, remarks) sitting above a **Submitted Results Table** listing every result that teacher has ever personally submitted, across every class/subject/exam type, with live status badges and full approval/rejection detail (who reviewed it, when, and why if rejected) shown directly in the table. Approved rows are visibly locked (🔒) rather than just quietly non-editable.

This required one genuinely necessary schema change: **Exam Type** (Assessment 1, Assessment 2, Monthly Test, Module Test, Mock Exam, Final Exam, Other) is now a real column on `Result`, and the table's uniqueness constraint was widened from `(studentId, subjectId, month)` to `(studentId, subjectId, month, examType)` — without that, a student's legitimate "Assessment 1" and "Monthly Test" in the same month would have collided as duplicates. Class-rank calculations were updated to match, so a Mock Exam score is never compared against a Monthly Test score as if they were the same assessment. Full rationale, and the two complete end-to-end workflow runs (approve path and reject→resubmit→approve path) that were used to verify this, are in `PHASE_NOTES.md`.

---

## Design tokens (Phase 8 brand palette: blue, green, white)

Defined in `client/tailwind.config.js`, so every page pulls from the same palette instead of ad-hoc colors. Rebuilt in Phase 8 around the mandated 3-color brand identity — everywhere else in this doc still calls the primary color "navy" simply because that's the token's name, not because navy is a fourth color:

| Token | Value | Use |
|---|---|---|
| `navy-700` | `#225775` | **Brand blue (exact)** — buttons, sidebar, headings, active nav, focus rings |
| `navy-800` / `navy-900` | `#1A4359` / `#12303F` | Darker shades — sidebar background, hover states, "rejected" status |
| `navy-50`–`navy-500` | tints of `#225775` | Light backgrounds, borders, zebra rows, "pending" status |
| `sky-500` | `#3D7A9E` | Accent — a lighter tint of the same blue family, not a separate hue |
| `green-500` | `#95C83E` | **Brand green (exact)** — success states, "approved" status, secondary buttons |
| `surface` | `#F5F8FA` | Page background — barely-off-white, blue-tinted |
| `ink` / `muted` | `#1A2E38` / `#5B7480` | Primary / secondary text — dark/medium blue-gray, not flat black |
| `approve` / `pending` / `reject` | `#95C83E` / `#4E8FAB` / `#12303F` | Status colors, built entirely from the blue/green scale (no red/amber) — see `PHASE_NOTES.md` for the accessibility approach (icons + lightness, not hue, distinguish them) |

Typography (unchanged from Phase 1): **Lora** (serif) for headings, **Inter** for body text and UI, **IBM Plex Mono** reserved for IDs/codes/timestamps.

Shared component classes (buttons, form fields, table zebra/hover/sticky-header) are defined once in `client/src/index.css` under `@layer components` — `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`, `.btn-link`, `.field-input`, `.field-label`, `.data-table`. Use these instead of one-off Tailwind strings so new pages stay visually consistent automatically.

---

## Phase 8 — Final Polish, UI/UX, Performance & Project Refinement

A full visual and usability pass across the entire application — no business logic, models, routes, or RBAC changed except two small, explicitly-justified additions (see below). Highlights: the whole app now runs on the 3-color brand palette above; every button, table, and form field pulls from shared classes rather than repeated one-off styling; every password field has a show/hide toggle; the dashboard header's profile area is now genuinely clickable (with a hover state and chevron) and takes the user to a real Profile page — including for the Examination Board account, which previously had no profile page of any kind; both the Student and Teacher profile pages gained an actual **Edit → Save** flow for their own contact details, since the original pages only ever displayed this data.

Two backend gaps were also fixed along the way, not just visual ones: `guardianName` (Student) and `qualification` (Teacher) had existed in the database since Phase 7 but were never actually returned by their own `getProfile` endpoints — a real, if minor, bug, now fixed.

One deliberate design decision worth knowing about: with only blue, green, and white as brand colors, "rejected"/error/danger states are distinguished from "approved" by **darkness and iconography** (a filled dark-navy badge with an X-circle icon) rather than by a red hue. This keeps the literal 3-color mandate while still meeting the "don't rely on color alone" accessibility principle — full reasoning in `PHASE_NOTES.md`.

No real logo file was attached to this request; a placeholder mark (a rounded blue square with a graduation-cap icon) was built instead, designed so dropping in a real logo image later is a one-line change in `client/src/components/common/Logo.jsx`.

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

The public Home page (`/`), Login page (`/login`), and all three portals — Student (`/student/*`), Teacher (`/teacher/*`), and Examination Board (`/admin/*`) — are fully built and backed by real data. There's nothing left running as a placeholder.
