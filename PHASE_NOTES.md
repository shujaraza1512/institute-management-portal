# Phase 6 — Teacher Portal

## A note on scope

The detailed Phase 6 requirements provided for this phase differ substantially from the "upload a results file" model in the original master spec: results are now entered directly per-student (not via Excel/CSV upload), and "uploads" are split into two distinct, fully-CRUD-able entities — **Assignments** and **Lecture Materials** — rather than one generic upload type. This phase follows the detailed requirements as the source of truth. Where that meant touching Phase 2/5 files, it's called out explicitly below, along with why.

## What was added

- **Teacher Dashboard** — welcome card (name, Employee ID, assigned subjects/classes), 4 summary cards (Total Assigned Classes, Total Students, Today's Lectures, Pending Result Uploads), recent announcements, and quick-action links to Results/Assignments/Lecture Materials/Timetable.
- **Student Result Management** — select Class → Subject → Exam Month, see every student in that class in a roster table (Roll Number, Name, Marks, Grade, Remarks, Status), and add/edit/delete a result inline per row. Marks/percentage/grade are validated and computed server-side — never trusted from the client.
- **Assignments** — full CRUD (title, description, class, subject, due date, optional file attachment).
- **Lecture Materials** — full CRUD, accepting either an uploaded file (PDF/PPT/DOC) or an external link, not both.
- **Timetable** — the teacher's own weekly schedule across every class they teach, with today highlighted.
- **Announcements** — read-only, audience `all` or `teachers`, newest first.
- **Profile** — name, email, phone, Employee ID, assigned classes/subjects, plus a change-password form.
- **Student-facing additions**: `GET /api/students/me/assignments` and `GET /api/students/me/lecture-materials` — read-only, scoped to the student's own class, satisfying "students should only see their own class's content." No new student-facing *pages* were built for these (out of scope for a phase titled Teacher Portal) — the endpoints exist and are tested; wiring them into Student Portal pages is a natural follow-up.

## Database changes

**`Result` (modified):**
- Added `status` (ENUM: `pending`/`approved`/`rejected`, default `pending`). Since results are now created directly by a teacher instead of being parsed from an approved file upload, something has to distinguish "visible to students" from "not yet reviewed" — this is that field. **Phase 5's student-facing queries were updated to filter `status: 'approved'`** (previously they had no status filter at all, since Result was defined to only ever contain approved data). This is the one real modification to already-shipped Phase 5 code, and it was necessary: without it, a teacher's freshly-entered pending marks would immediately leak to students, undoing "teacher cannot publish results directly" from the original spec.
- Added `createdBy` (User id). What makes "a teacher cannot edit another teacher's result" and "Pending Result Uploads" (dashboard count) both concretely enforceable/computable, rather than inferred from class/subject assignment alone.
- Added a `beforeSave` hook that recomputes `grade` from `marks`/`totalMarks` on every create/update, using a fixed scale (A+ ≥90, A ≥80, B+ ≥70, B ≥60, C ≥50, D ≥40, else F). `grade` is never accepted from client input.
- **Business rule added**: once a result's status is `approved`, a teacher can no longer edit or delete it (409 response) — it's already been published to students.

**`Assignment` (new):** `teacherId`, `classId`, `subjectId`, `title`, `description`, `dueDate`, `attachmentPath` (nullable).

**`LectureUnit` (modified):** added `description` and `externalLink`; `filePath` is now nullable (a material is either a file or a link, validated in the controller). The `assignment` value was removed from the `materialType` enum, now `pdf`/`notes`/`slides`/`link`, since Assignments are their own model.

**Not used by this phase:** `TeacherUpload` (the Phase 2 file-based upload concept) remains in the schema untouched but nothing in Phase 6 creates new rows there — it's superseded by direct Result entry for this phase's scope.

**One important operational note:** `server.js` calls `sequelize.sync()` (no `alter`), which only creates missing tables — it will **not** add the new columns above to an already-existing database. As with Phase 5's `guardianPhone` addition, run `node seed/seed.js` after integrating to pick up the schema changes (this project is still at the seed-data stage, so this is a non-issue in practice).

## API endpoints

All under `/api/teachers`, requiring `protect` + `authorize('teacher')` + `loadTeacher` (resolves `req.teacher` from the session — no route accepts a `teacherId` from the client):

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me/dashboard` | Dashboard summary |
| GET | `/me/profile` | Profile info |
| PUT | `/me/password` | Change password |
| GET | `/me/classes` | Assigned classes/subjects (data source for form dropdowns) |
| GET | `/me/timetable` | Teacher's own weekly timetable |
| GET | `/me/announcements` | Announcements (audience `all`/`teachers`) |
| GET | `/me/results` | Roster for `?classId=&subjectId=&month=` |
| POST | `/me/results` | Create a result |
| PUT | `/me/results/:id` | Edit a result (own, not-yet-approved only) |
| DELETE | `/me/results/:id` | Delete a result (own, not-yet-approved only) |
| GET/POST/PUT/DELETE | `/me/assignments[/:id]` | Assignment CRUD (own records only) |
| GET/POST/PUT/DELETE | `/me/lecture-materials[/:id]` | Lecture Material CRUD (own records only) |

Plus two additions elsewhere:
- `GET /api/students/me/assignments`, `GET /api/students/me/lecture-materials` — student-facing, class-scoped reads.
- `GET /api/files/assignments/:id/download`, `GET /api/files/lecture-materials/:id/download` — authenticated, class-scoped file downloads (see "Security fix" below).

## Modified files (and why)

```
server/models/Result.js            -- status, createdBy, grade hook
server/models/LectureUnit.js       -- description, externalLink, nullable filePath
server/models/Class.js             -- Assignment association
server/models/Subject.js           -- Assignment association
server/models/Teacher.js           -- Assignment association (had to alias it
                                       homeworkAssignments -- see "Bugs caught" below)
server/controllers/studentController.js  -- status:'approved' filter (see Database changes)
server/routes/studentRoutes.js     -- 2 new read-only routes
server/routes/index.js             -- mounts /api/teachers and /api/files
server/app.js                      -- removed public static /uploads mount (security)
server/middleware/errorHandler.js  -- graceful Multer + unique-constraint error handling
server/seed/seed.js                -- see below
client/src/constants/sidebarLinks.js  -- teacher section rewritten (see below)
client/src/hooks/useFetch.js        -- supports a falsy/conditional endpoint (skips fetch)
client/src/pages/teacher/Dashboard.jsx  -- was a placeholder, now real
README.md
```

**Sidebar rewrite, explained:** the Phase 1 teacher sidebar (Upload Results / Upload Lecture Units / Upload Monthly Paper / My Classes) matched the *original* spec's file-upload model. The detailed Phase 6 spec's page set is entirely different (Dashboard, Results, Assignments, Lecture Materials, Timetable, Announcements, Profile), so the sidebar had to change to match what was actually built — the old links pointed at pages that no longer exist under this design. "My Classes" specifically was folded into the Results page's class/subject selector plus the Dashboard's summary cards, since the detailed spec doesn't call for it as a separate page.

## New files

**Backend:**
```
server/models/Assignment.js
server/middleware/loadTeacher.js
server/middleware/uploadFile.js
server/controllers/teacherController.js
server/controllers/resultController.js
server/controllers/assignmentController.js
server/controllers/lectureMaterialController.js
server/routes/teacherRoutes.js
server/routes/downloadRoutes.js
```

**Frontend:**
```
client/src/components/teacher/StatusBadge.jsx
client/src/components/teacher/ClassSubjectFields.jsx
client/src/pages/teacher/Results.jsx
client/src/pages/teacher/Assignments.jsx
client/src/pages/teacher/LectureMaterials.jsx
client/src/pages/teacher/Timetable.jsx
client/src/pages/teacher/Announcements.jsx
client/src/pages/teacher/Profile.jsx
```

## Security fix made along the way

Phase 1's `app.js` served the entire `uploads/` folder publicly via `express.static('uploads')` — harmless while no real files existed, but Phase 6 introduces real assignment attachments and lecture material files. Left as-is, anyone with (or guessing) a file URL could download it with zero login. Replaced with two authenticated routes (`server/routes/downloadRoutes.js`) that check the requester's role and, for students, that the file actually belongs to their own class.

## New dependencies

**None.** `multer` was already a dependency since Phase 1.

## New environment variables

**None.**

## Test credentials

All via `node seed/seed.js`, password `Password123!` for everyone:

| Role | ID | Notes |
|---|---|---|
| Teacher | `TCH-101` (ayesha.khan@institute.edu) | Teaches CS to class 10-A. Has results (including 2 pending), assignments, and materials — the main "everything works" account. |
| Teacher | `TCH-102` (bilal.sheikh@institute.edu) | Teaches English to class 10-A. Used to prove cross-teacher isolation against TCH-101. |
| Teacher | `TCH-103` (nadia.farooq@institute.edu) | Zero assignments at all — use to check every empty state. |
| Student | `STU-2001` / `STU-2002` / `STU-2003` | Same as Phase 5 (Phase 5's `PHASE_NOTES.md` git history has the details). |
| — | Class `10-B` exists but has no teacher assigned to it | Use to test "teacher cannot access another class unless assigned." |

## Testing performed

Everything below was run against a real MySQL instance with curl, not just written and assumed correct:

- **Dashboard stats correctness:** Ayesha's dashboard showed exactly 1 assigned class, 3 total students, 2 pending result uploads — all manually cross-checked against the seed data. Nadia's (no assignments) came back all zeros with no errors.
- **Roster view:** confirmed it lists every student in the selected class, correctly merging in existing results (marks/grade/status) for students who have one and showing blanks for those who don't.
- **Grade auto-calculation:** confirmed via direct SQL that `grade` is computed correctly against the documented scale (91→A+, 82→A, 74→B+, etc.) after fixing a real bug (below).
- **Validation:** marks exceeding total marks → 400; negative marks → 400; duplicate result (same student/subject/month) → 409 with a clear message.
- **Cross-teacher isolation:** Bilal was blocked (403) from editing/deleting a result, assignment, and lecture material created by Ayesha, even though both teach the same class.
- **Cross-class isolation:** Ayesha was blocked (403) from creating a result for class 10-B, which she isn't assigned to.
- **Approved-result lock:** editing/deleting an already-`approved` result returns 409, not a silent success.
- **Cross-role rejection:** a student's session hitting any `/api/teachers/*` route returns 403; no session at all returns 401 (verified as two distinct cases, not conflated).
- **Student-side scoping:** confirmed `/api/students/me/assignments` and `/api/students/me/lecture-materials` return content from *both* of a class's teachers (Ayesha's and Bilal's), correctly aggregated by class rather than by teacher.
- **Phase 5 regression:** re-verified that Ali's dashboard/results/overall-average reflect *only* approved results — the 2 pending June results created in this phase's seed data are correctly invisible to students, and the overall average (80.75%) matches the pre-Phase-6 calculation exactly.
- **Full Phase 3 auth regression:** login, wrong role, logout all re-confirmed unchanged.
- `npm run build` completed with zero errors (same pre-existing, non-blocking `recharts` bundle-size warning as previous phases).

### Bugs caught and fixed during this process

1. **Alias collision:** `Teacher.js` already had a `hasMany(TeacherAssignment, { as: 'assignments' })` association from Phase 2. Adding `hasMany(Assignment, { as: 'assignments' })` for the new model collided with it — Sequelize refused to start with a clear `AssociationError`. Fixed by aliasing the new one `homeworkAssignments`.
2. **Grade silently null:** the `beforeSave` hook that computes `grade` never fired for any seeded result. Root cause: Sequelize's `bulkCreate()` skips model hooks by default unless `{ individualHooks: true }` is passed — `seed.js` used plain `bulkCreate()`. Confirmed via direct SQL query showing every row's `grade` as `NULL`, fixed by adding the option, re-verified all grades compute correctly afterward. (The actual API-driven create/update path was never affected — `Model.create()` and `instance.save()` always run hooks; this was purely a seed-script issue.)

## Integration instructions

```bash
cd /path/to/your/local/institute-management-portal
git status                              # make sure your working tree is clean
git am /path/to/phase6-teacher-portal.patch
cd server && npm install && node seed/seed.js    # new Result columns + Assignment table
cd ../client && npm install
git push
```

If `git am` conflicts, abort it (`git am --abort`) and copy these paths from the extracted zip instead, overwriting where they already exist: every file listed under "New files" above, plus every file listed under "Modified files." Then:

```bash
git add -A
git commit -m "Phase 6: Add Teacher Portal"
git push
```
