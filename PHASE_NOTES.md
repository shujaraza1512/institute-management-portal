# Phase 5 — Student Portal

## What was added

The first fully functional portal in the app. Every page listed below fetches real data from the database through a dedicated API endpoint — nothing is hardcoded or mocked on the frontend.

- **Dashboard** — welcome card (name, class/section, Institute ID), overall attendance %, overall academic average, and 4 summary cards (Subjects, Upcoming Exam, Latest Result, Announcements).
- **Results** — table of published results (subject, marks, grade, percentage, class position, month, teacher remarks), filterable by month.
- **Progress** — monthly average trend (line chart) and subject-wise performance (bar chart), plus an overall average, using `recharts`.
- **Timetable** — weekly class timetable, with today's classes highlighted.
- **Paper Schedule** — upcoming exams for the student's class (subject, date, time, duration, room).
- **Announcements** — notices from the Examination Board, newest first.
- **Profile** — student info (name, email, phone, parent contact, class, roll number, address) plus a working change-password form.

Every one of these shows a loading state while fetching, an error state (with retry) if the request fails, and an appropriate empty state if there's genuinely no data yet — verified for all three, not just designed for them (see "How this was tested").

## How student data isolation works

`server/middleware/loadStudent.js` runs after `protect` + `authorize('student')` on every route in `server/routes/studentRoutes.js`. It looks up the Student profile linked to the *logged-in user* and attaches it as `req.student`. **No route in this phase accepts a student ID from the client at all** — every handler works with "my own record," resolved server-side. This isn't "check that studentId belongs to this user" logic bolted onto each route (which is easy to get wrong on one route and forget on another) — there's structurally no parameter through which a student could even attempt to ask for someone else's data.

## Database changes

Two small, deliberate additions — both are additive (new table / new nullable column), nothing existing was altered or removed:

1. **New `Attendance` model** (`server/models/Attendance.js`): `studentId`, `classId`, `date`, `status` (`present`/`absent`/`leave`), unique on `(studentId, date)`. The original spec listed full "Attendance Management" as a *future* feature, and Phase 2's schema (already reviewed and shipped) has no attendance table at all. Since the Dashboard requirement explicitly asks for a real attendance percentage, and "no dummy frontend-only data" ruled out faking it, this is the smallest table that makes that number real. It does **not** include any teacher-facing "mark attendance" workflow — that's out of scope here.
2. **New `guardianPhone` column on `Student`** (`server/models/Student.js`): the Profile page's "Parent Contact" field didn't correspond to anything in the Phase 2 schema either.

**Important:** `server.js` calls `sequelize.sync()` (no `alter`), which only creates *missing* tables — it will **not** retroactively add the new `guardianPhone` column to an already-existing `students` table. If you already have a database from Phase 2/3/4, you need to re-run `node seed/seed.js` (drops and recreates every table, including this one) to pick up the schema change. This project is still at the dev/seed-data stage, so that's a non-issue — just know it's not something `npm run dev` alone will fix.

## New API endpoints

All under `/api/students`, all requiring a valid student session (`protect` + `authorize('student')` + `loadStudent`):

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me/dashboard` | Composed summary for the dashboard (one call instead of five) |
| GET | `/me/profile` | Student info for the Profile page |
| PUT | `/me/password` | Change password (current + new, min 8 chars) |
| GET | `/me/results` | Results list; optional `?month=YYYY-MM` filter |
| GET | `/me/progress` | Monthly trend + subject-wise averages + overall average |
| GET | `/me/timetable` | Weekly timetable for the student's class |
| GET | `/me/paper-schedule` | Upcoming exams for the student's class |
| GET | `/me/announcements` | Announcements with audience `all` or `students`, newest first |

## Files changed

**New (backend):**
```
server/models/Attendance.js
server/middleware/loadStudent.js
server/controllers/studentController.js
server/routes/studentRoutes.js
```

**New (frontend):**
```
client/src/hooks/useFetch.js
client/src/components/common/LoadingState.jsx
client/src/components/common/ErrorState.jsx
client/src/components/common/EmptyState.jsx
client/src/components/common/SummaryCard.jsx
client/src/pages/student/Results.jsx
client/src/pages/student/Progress.jsx
client/src/pages/student/Timetable.jsx
client/src/pages/student/PaperSchedule.jsx
client/src/pages/student/Announcements.jsx
client/src/pages/student/Profile.jsx
```

**Modified:**
```
server/models/Student.js          (added guardianPhone field + Attendance association)
server/models/Class.js            (added Attendance association)
server/routes/index.js            (mounts /api/students)
server/seed/seed.js               (expanded — see below)
client/src/pages/student/Dashboard.jsx   (was a placeholder — now real)
client/src/App.jsx                 (added the 6 new nested student routes)
client/src/constants/sidebarLinks.js     (added "Announcements" — see note below)
README.md
```

**One sidebar change worth flagging:** the original Phase 1 sidebar (matching the original spec) didn't include a separate "Announcements" link — announcements were only ever meant to appear on the Dashboard. But this phase's requirements list Announcements as its own module alongside Results/Progress/Timetable, and I built it as a full page. Without adding the link, that page would only be reachable by typing the URL directly, so I added one line to `studentSidebarLinks` in `client/src/constants/sidebarLinks.js`. This is the one "modify a previous phase's file" exception, and it's purely additive (one array entry).

**Untouched:** `AuthContext.jsx`, `ProtectedRoute.jsx`, `Login.jsx`, `DashboardLayout.jsx`, `TeacherLayout.jsx`, `AdminLayout.jsx`, every Phase 4 `components/home/*` file, and the Teacher/Admin dashboard placeholders. Verified with `git status` before committing, not assumed.

## New dependencies

**None.** `recharts` (Progress charts) and `lucide-react` (icons) were both already in `client/package.json` since Phase 1. `bcryptjs`/`sequelize`/`express-validator` on the backend likewise already present.

## New environment variables

**None.**

## Test credentials

All seeded by `node seed/seed.js`, all using password `Password123!`:

| Role | Institute ID | Email | Notes |
|---|---|---|---|
| Student | `STU-2001` | ali.raza@institute.edu | Has results + attendance |
| Student | `STU-2002` | sara.ahmed@institute.edu | Same class as Ali, **different** results/attendance — use this pair to verify data isolation |
| Student | `STU-2003` | zara.malik@institute.edu | Same class, but **zero** results/attendance — use this to verify empty states |
| Teacher | `TCH-101` | ayesha.khan@institute.edu | For the cross-role 403 test |
| Admin | `ADM-001` | admin@institute.edu | For the cross-role 403 test |

## How this was tested

Everything below was actually run against a real MySQL instance with curl, not just written and assumed to work:

- **Cross-student isolation:** logged in as Ali and Sara (same class) separately and confirmed each account's `/me/dashboard` and `/me/results` return completely different numbers (Ali: 85% attendance, 80.75 overall average; Sara: 80% attendance, 89 overall average) with no overlap in result IDs.
- **Empty states:** logged in as Zara (zero results/attendance) and confirmed `attendancePercentage`/`overallAverage`/`latestResult` all come back `null`, `results`/`progress` come back as empty arrays, while `timetable` (class-wide, not personal) still correctly returns data. Frontend empty-state components render for each of these.
- **Unauthorized access → 403:** a teacher's session cookie hitting `/api/students/me/dashboard` returns 403 with a clear message.
- **No session → 401:** the same request with no cookie at all returns 401 (distinct from the 403 case — authenticated-but-wrong-role vs. not-authenticated-at-all).
- **Position/rank calculation:** manually cross-checked Ali's and Sara's marks against the returned `position` values for every subject/month combination — all correct.
- **Attendance percentage math:** manually verified against the seeded present/absent/leave counts.
- **Change password:** wrong current password → 401; new password under 8 characters → 400 validation error; correct change → 200, followed by successfully logging in with the new password.
- **Month filter on Results:** confirmed `?month=2026-05` returns only that month's rows.
- **All 8 endpoints** were exercised individually via curl in addition to the above.
- **Regression check:** re-ran the full Phase 3 auth test matrix (login, wrong role, wrong password, logout, `/me`) after building this phase — identical results, no regressions.
- `npm run build` completed with zero errors (one non-blocking warning about `recharts` pushing the JS bundle over 500kB — worth revisiting with code-splitting in Phase 8, not a correctness issue).

## How to test this yourself

```bash
cd server
cp .env.example .env    # fill in your MySQL credentials if you haven't already
npm install
node seed/seed.js        # re-run this even if you seeded before -- picks up Attendance + guardianPhone
npm run dev

# separate terminal
cd client
npm install
npm run dev
```

Log in as `STU-2001` (`Password123!`) and click through every sidebar item — Dashboard, Results (try the month picker), Progress (charts should render), Timetable (today's row should be tinted), Paper Schedule, Announcements, Profile (try changing the password, then log out and back in with the new one). Then log in as `STU-2003` to see the empty states instead.

## Integration instructions

```bash
cd /path/to/your/local/institute-management-portal
git status                              # make sure your working tree is clean
git am /path/to/phase5-student-portal.patch
cd server && npm install && node seed/seed.js    # new Attendance table + guardianPhone column
cd ../client && npm install
git push
```

If `git am` conflicts, abort it (`git am --abort`) and copy these paths from the extracted zip into your repo instead:

```
server/models/Attendance.js                (new)
server/middleware/loadStudent.js           (new)
server/controllers/studentController.js    (new)
server/routes/studentRoutes.js             (new)
server/models/Student.js                   (replace)
server/models/Class.js                     (replace)
server/routes/index.js                     (replace)
server/seed/seed.js                        (replace)
client/src/hooks/useFetch.js                (new)
client/src/components/common/              (new folder, 4 files)
client/src/pages/student/                  (replace all 7 files)
client/src/App.jsx                          (replace)
client/src/constants/sidebarLinks.js        (replace)
README.md                                   (replace)
```

Then:
```bash
git add -A
git commit -m "Phase 5: Add Student Portal"
git push
```
