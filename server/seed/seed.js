// Populates enough data to exercise the Student Portal (Phase 5) and Teacher
// Portal (Phase 6) properly: two students with real data in the same class
// (to prove data isolation), a third with none (empty states), two teachers
// with assignments (to prove cross-teacher isolation), a third teacher with
// none (empty states), and a second class neither assigned teacher teaches
// (to prove "cannot access another class unless assigned"). Run with:
// node seed/seed.js
// NOT for production use — sync({ force: true }) drops and recreates tables.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

const run = async () => {
  // force:true drops and recreates every table, but MySQL enforces foreign
  // keys during DROP TABLE, and Sequelize doesn't always drop tables in
  // dependency order for a schema this interconnected. Disabling checks for
  // just this destructive step (dev/demo seeding only) avoids that.
  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.sequelize.sync({ force: true });
  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // --- Users -----------------------------------------------------------------
  const admin = await db.User.create({
    name: 'Exam Board Admin',
    email: 'admin@institute.edu',
    instituteId: 'ADM-001',
    password: passwordHash,
    role: 'admin',
  });

  const teacherUser1 = await db.User.create({
    name: 'Ayesha Khan',
    email: 'ayesha.khan@institute.edu',
    instituteId: 'TCH-101',
    password: passwordHash,
    role: 'teacher',
  });

  const teacherUser2 = await db.User.create({
    name: 'Bilal Sheikh',
    email: 'bilal.sheikh@institute.edu',
    instituteId: 'TCH-102',
    password: passwordHash,
    role: 'teacher',
  });

  // Deliberately has zero assignments -- used to test the Teacher Portal's
  // empty states (dashboard, classes, results, assignments, materials).
  const teacherUser3 = await db.User.create({
    name: 'Nadia Farooq',
    email: 'nadia.farooq@institute.edu',
    instituteId: 'TCH-103',
    password: passwordHash,
    role: 'teacher',
  });

  const studentUser1 = await db.User.create({
    name: 'Ali Raza',
    email: 'ali.raza@institute.edu',
    instituteId: 'STU-2001',
    password: passwordHash,
    role: 'student',
  });

  const studentUser2 = await db.User.create({
    name: 'Sara Ahmed',
    email: 'sara.ahmed@institute.edu',
    instituteId: 'STU-2002',
    password: passwordHash,
    role: 'student',
  });

  // Deliberately has no results/attendance below — used to test that the
  // Student Portal's empty states render correctly instead of breaking.
  const studentUser3 = await db.User.create({
    name: 'Zara Malik',
    email: 'zara.malik@institute.edu',
    instituteId: 'STU-2003',
    password: passwordHash,
    role: 'student',
  });

  // --- Classes & Subjects --------------------------------------------------------
  const csSubject = await db.Subject.create({ name: 'Computer Science', code: 'CS-101' });
  const engSubject = await db.Subject.create({ name: 'English', code: 'ENG-101' });

  // --- Profiles ----------------------------------------------------------------
  const teacher1 = await db.Teacher.create({ userId: teacherUser1.id, department: 'Computer Science', qualification: 'MSc Computer Science' });
  const teacher2 = await db.Teacher.create({ userId: teacherUser2.id, department: 'English', qualification: 'MA English Literature' });
  const teacher3 = await db.Teacher.create({ userId: teacherUser3.id, department: 'Mathematics', qualification: 'MSc Mathematics' });

  // Ayesha (teacher1) is class 10-A's homeroom/class teacher -- added in
  // Phase 7 for Class Management. Set after teacher1 exists, so it's a real
  // foreign key rather than null.
  const class10A = await db.Class.create({ name: '10', section: 'A', classTeacherId: teacher1.id });
  // Neither teacher below is assigned to this class/subject combo -- used to
  // prove a teacher gets 403 trying to touch a class they don't teach. Also
  // has no classTeacherId -- used to test the Phase 7 "no class teacher" empty case.
  const class10B = await db.Class.create({ name: '10', section: 'B' });

  const student1 = await db.Student.create({
    userId: studentUser1.id,
    classId: class10A.id,
    rollNumber: '01',
    phone: '+92 300 1112233',
    address: 'House 12, Street 4, Gulshan-e-Iqbal, Karachi',
    guardianPhone: '+92 300 9998877',
    guardianName: 'Raza Ahmed',
    admissionDate: '2024-08-15',
  });

  const student2 = await db.Student.create({
    userId: studentUser2.id,
    classId: class10A.id,
    rollNumber: '02',
    phone: '+92 300 4445566',
    address: 'Flat 6B, Bahadurabad, Karachi',
    guardianPhone: '+92 300 7776655',
    guardianName: 'Ahmed Siddiqui',
    admissionDate: '2024-08-15',
  });

  // Same class as the other two, but no results/attendance created for her.
  const student3 = await db.Student.create({
    userId: studentUser3.id,
    classId: class10A.id,
    rollNumber: '03',
    phone: '+92 300 8889900',
    address: 'House 3, Block 2, PECHS, Karachi',
    guardianPhone: '+92 300 6665544',
    guardianName: 'Malik Farooq',
    admissionDate: '2025-01-10',
  });

  // --- Teacher assignments -------------------------------------------------------
  // Note: class10B has no assignments at all -- neither teacher1 nor
  // teacher2 teaches it, which is exactly what the cross-class test needs.
  await db.TeacherAssignment.create({ teacherId: teacher1.id, classId: class10A.id, subjectId: csSubject.id });
  await db.TeacherAssignment.create({ teacherId: teacher2.id, classId: class10A.id, subjectId: engSubject.id });

  // --- Timetable -----------------------------------------------------------------
  await db.Timetable.bulkCreate([
    { classId: class10A.id, subjectId: csSubject.id, teacherId: teacher1.id, day: 'Monday', startTime: '09:00:00', endTime: '09:45:00', room: 'Lab 1' },
    { classId: class10A.id, subjectId: engSubject.id, teacherId: teacher2.id, day: 'Wednesday', startTime: '10:00:00', endTime: '10:45:00', room: 'Room 4' },
    { classId: class10A.id, subjectId: csSubject.id, teacherId: teacher1.id, day: 'Friday', startTime: '11:00:00', endTime: '11:45:00', room: 'Lab 1' },
  ]);

  // --- Paper schedule --------------------------------------------------------------
  await db.PaperSchedule.bulkCreate([
    { examName: 'Mid-Term Examination', classId: class10A.id, subjectId: csSubject.id, examDate: '2026-08-15', startTime: '10:00:00', durationMinutes: 90, room: 'Hall A' },
    { examName: 'Mid-Term Examination', classId: class10A.id, subjectId: engSubject.id, examDate: '2026-08-18', startTime: '10:00:00', durationMinutes: 90, room: 'Hall A' },
  ]);

  // --- Lecture materials (Phase 6: description/link support added) ---------------------------------------
  await db.LectureUnit.create({
    teacherId: teacher1.id,
    classId: class10A.id,
    subjectId: csSubject.id,
    title: 'Unit 1: Problem Solving and Algorithms',
    description: 'Introductory notes covering flowcharts, pseudocode, and basic algorithm design.',
    materialType: 'notes',
    filePath: '/uploads/lecture-materials/unit1-notes.pdf',
  });
  await db.LectureUnit.create({
    teacherId: teacher2.id,
    classId: class10A.id,
    subjectId: engSubject.id,
    title: 'Grammar Reference Guide',
    description: 'A supplementary external resource for grammar practice.',
    materialType: 'link',
    externalLink: 'https://www.grammarly.com/blog/grammar-basics/',
  });

  // --- Assignments (new in Phase 6) ---------------------------------------
  await db.Assignment.bulkCreate([
    {
      teacherId: teacher1.id,
      classId: class10A.id,
      subjectId: csSubject.id,
      title: 'Flowchart Practice Set',
      description: 'Draw flowcharts for the five problems listed in Unit 1, Exercise 3.',
      dueDate: '2026-07-20',
    },
    {
      teacherId: teacher2.id,
      classId: class10A.id,
      subjectId: engSubject.id,
      title: 'Essay: My Summer Vacation',
      description: 'Write a 300-word essay. Focus on descriptive language.',
      dueDate: '2026-07-15',
    },
  ]);

  // --- Teacher upload (legacy Phase 2 concept -- not used by Phase 6's direct-entry
  // results flow, kept only because it already existed and nothing reads it) -----------------------
  await db.TeacherUpload.create({
    teacherId: teacher1.id,
    classId: class10A.id,
    subjectId: csSubject.id,
    type: 'result',
    month: '2026-06',
    filePath: '/uploads/june-results.xlsx',
    status: 'pending',
  });

  // --- Results ----------------------------------------
  // Approved results (student-visible) -- two months x two subjects for
  // each of the two "real" students, so Progress has an actual trend line.
  // reviewedBy/reviewedAt reflect that these already went through the Phase
  // 7 approval workflow (approved by the admin account).
  await db.Result.bulkCreate([
    { studentId: student1.id, subjectId: csSubject.id, classId: class10A.id, marks: 82, totalMarks: 100, teacherRemarks: 'Consistent performance throughout the month.', month: '2026-04', status: 'approved', createdBy: teacherUser1.id, reviewedBy: admin.id, reviewedAt: new Date('2026-05-02') },
    { studentId: student1.id, subjectId: csSubject.id, classId: class10A.id, marks: 88, totalMarks: 100, teacherRemarks: 'Excellent improvement.', month: '2026-05', status: 'approved', createdBy: teacherUser1.id, reviewedBy: admin.id, reviewedAt: new Date('2026-06-02') },
    { studentId: student1.id, subjectId: engSubject.id, classId: class10A.id, marks: 74, totalMarks: 100, teacherRemarks: 'Good vocabulary, work on grammar.', month: '2026-04', status: 'approved', createdBy: teacherUser2.id, reviewedBy: admin.id, reviewedAt: new Date('2026-05-02') },
    { studentId: student1.id, subjectId: engSubject.id, classId: class10A.id, marks: 79, totalMarks: 100, teacherRemarks: 'Steady progress.', month: '2026-05', status: 'approved', createdBy: teacherUser2.id, reviewedBy: admin.id, reviewedAt: new Date('2026-06-02') },

    { studentId: student2.id, subjectId: csSubject.id, classId: class10A.id, marks: 91, totalMarks: 100, teacherRemarks: 'Outstanding logical thinking.', month: '2026-04', status: 'approved', createdBy: teacherUser1.id, reviewedBy: admin.id, reviewedAt: new Date('2026-05-02') },
    { studentId: student2.id, subjectId: csSubject.id, classId: class10A.id, marks: 85, totalMarks: 100, teacherRemarks: 'Solid work.', month: '2026-05', status: 'approved', createdBy: teacherUser1.id, reviewedBy: admin.id, reviewedAt: new Date('2026-06-02') },
    { studentId: student2.id, subjectId: engSubject.id, classId: class10A.id, marks: 88, totalMarks: 100, teacherRemarks: 'Confident writing style.', month: '2026-04', status: 'approved', createdBy: teacherUser2.id, reviewedBy: admin.id, reviewedAt: new Date('2026-05-02') },
    { studentId: student2.id, subjectId: engSubject.id, classId: class10A.id, marks: 92, totalMarks: 100, teacherRemarks: 'Excellent essay structure.', month: '2026-05', status: 'approved', createdBy: teacherUser2.id, reviewedBy: admin.id, reviewedAt: new Date('2026-06-02') },
    // student3 (Zara Malik) intentionally has zero Result rows.
  ], { individualHooks: true }); // bulkCreate skips model hooks unless told otherwise -- needed so grade actually gets computed

  // Pending results (Phase 6): submitted by Ayesha for June, not yet
  // reviewed -- these must NOT show up in student1/student2's Phase 5
  // views, but SHOULD show up in Ayesha's "Pending Result Uploads" count,
  // in her Results roster as editable rows, and in the Phase 7 admin
  // Result Approval queue awaiting a decision.
  await db.Result.bulkCreate([
    { studentId: student1.id, subjectId: csSubject.id, classId: class10A.id, marks: 84, totalMarks: 100, teacherRemarks: 'June test.', month: '2026-06', status: 'pending', createdBy: teacherUser1.id },
    { studentId: student2.id, subjectId: csSubject.id, classId: class10A.id, marks: 89, totalMarks: 100, teacherRemarks: 'June test.', month: '2026-06', status: 'pending', createdBy: teacherUser1.id },
  ], { individualHooks: true });

  // A rejected result (Phase 7) -- Bilal's June English submission for Ali
  // was rejected by the admin with a reason, and hasn't been resubmitted
  // yet. Used to test the "rejected" filter/display and the resubmit-on-
  // edit flow (editing this via Phase 6's updateResult should flip it back
  // to pending).
  await db.Result.create(
    {
      studentId: student1.id,
      subjectId: engSubject.id,
      classId: class10A.id,
      marks: 95,
      totalMarks: 100,
      teacherRemarks: 'June test.',
      month: '2026-06',
      status: 'rejected',
      createdBy: teacherUser2.id,
      reviewedBy: admin.id,
      reviewedAt: new Date('2026-07-01'),
      rejectionReason: 'Marks seem inconsistent with the paper submitted -- please double-check and resubmit.',
    }
  );

  // A second exam type for the same student/subject/month as an existing
  // result (Phase 7.5) -- proves the widened unique index (studentId,
  // subjectId, month, examType) actually works: Ali already has an
  // approved "Monthly Test" for CS in April; this is a separate, also-
  // approved "Assessment 1" for the same subject/month, which the old
  // 3-column unique index would have incorrectly rejected as a duplicate.
  await db.Result.create(
    {
      studentId: student1.id,
      subjectId: csSubject.id,
      classId: class10A.id,
      marks: 78,
      totalMarks: 100,
      examType: 'Assessment 1',
      teacherRemarks: 'First assessment of the term.',
      month: '2026-04',
      status: 'approved',
      createdBy: teacherUser1.id,
      reviewedBy: admin.id,
      reviewedAt: new Date('2026-04-20'),
    }
  );

  // --- Attendance ----------------------------------------------------------------
  // Same 20 school days for both students, with different absences/leaves
  // scattered in so their computed percentages are realistic and different
  // from each other (not a suspicious flat 100%). student3 gets none, again
  // on purpose, to exercise the empty state.
  const schoolDays = [
    '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05',
    '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12',
    '2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19',
    '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26',
  ];

  const buildAttendance = (studentId, classId, absentDays, leaveDays) =>
    schoolDays.map((date) => ({
      studentId,
      classId,
      date,
      status: absentDays.includes(date) ? 'absent' : leaveDays.includes(date) ? 'leave' : 'present',
    }));

  await db.Attendance.bulkCreate([
    ...buildAttendance(student1.id, class10A.id, ['2026-06-05', '2026-06-17'], ['2026-06-23']),
    ...buildAttendance(student2.id, class10A.id, ['2026-06-02', '2026-06-09', '2026-06-16', '2026-06-24'], []),
  ]);

  // --- Announcements ---------------------------------------------------------------
  await db.Announcement.bulkCreate([
    {
      title: 'Result Cards for May Now Published',
      description: 'Students can view their May results under the Results tab.',
      audience: 'students',
      postedBy: admin.id,
    },
    {
      title: 'Monthly Test Schedule Released',
      description: 'Check the Paper Schedule page for the August exam dates.',
      audience: 'all',
      postedBy: admin.id,
    },
    {
      title: 'Staff Meeting -- July 10th',
      description: 'All teaching staff should attend the monthly review meeting in the staff room.',
      audience: 'teachers',
      postedBy: admin.id,
    },
    // Already expired -- used to confirm the Admin Dashboard's "Active
    // Announcements" count correctly excludes it, while the Announcement
    // Management list (which shows everything, active or not) still does.
    {
      title: 'Spring Break Schedule (Expired)',
      description: 'This notice covered the spring break period, which has now passed.',
      audience: 'all',
      postedBy: admin.id,
      publishAt: new Date('2026-03-01'),
      expiryDate: new Date('2026-03-15'),
    },
    // Scheduled for the future -- used to confirm it does NOT count as
    // active yet, and does NOT show up in Phase 5/6's "current" reads.
    {
      title: 'Winter Break Notice (Scheduled)',
      description: 'This will be visible once winter break planning is finalized.',
      audience: 'all',
      postedBy: admin.id,
      publishAt: new Date('2026-12-01'),
    },
  ]);

  console.log('Seed complete.\n');
  console.log('Test accounts (all use password: Password123!):');
  console.log('  Admin   -> ADM-001 / admin@institute.edu');
  console.log('  Teacher -> TCH-101 / ayesha.khan@institute.edu   (CS, class 10-A, class teacher of 10-A -- has results/assignments/materials + 2 pending results)');
  console.log('  Teacher -> TCH-102 / bilal.sheikh@institute.edu  (English, class 10-A -- has results/assignments/materials + 1 rejected result)');
  console.log('  Teacher -> TCH-103 / nadia.farooq@institute.edu  (no assignments at all -- for testing empty states)');
  console.log('  Student -> STU-2001 / ali.raza@institute.edu     (has approved results + attendance; also has 1 pending + 1 rejected result)');
  console.log('  Student -> STU-2002 / sara.ahmed@institute.edu   (has approved results + attendance -- different numbers than Ali)');
  console.log('  Student -> STU-2003 / zara.malik@institute.edu   (no results/attendance -- for testing empty states)');
  console.log('  Class 10-B exists, no teacher assigned to it, no class teacher -- for testing cross-class 403s and empty class-teacher display.');
  console.log('  3 pending results await review in the Phase 7 Result Approval queue; 1 rejected result exists to test that filter/view.');
  console.log('  1 expired + 1 future-scheduled announcement exist to test Phase 7 scheduling and that they stay hidden from students/teachers.');
  console.log('  Ali has TWO approved CS results for April 2026 -- a Monthly Test and a separate Assessment 1 -- proving the Phase 7.5 examType-aware unique index and ranking.');

  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
