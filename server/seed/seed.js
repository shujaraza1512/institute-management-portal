// Populates enough data across every model to exercise the Student Portal
// (Phase 5) properly: two students with real data in the same class (to
// prove data isolation between them) plus a third with no personal records
// at all (to exercise empty states). Run with: node seed/seed.js
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

  // --- Class & Subjects --------------------------------------------------------
  const class10A = await db.Class.create({ name: '10', section: 'A' });
  const csSubject = await db.Subject.create({ name: 'Computer Science', code: 'CS-101' });
  const engSubject = await db.Subject.create({ name: 'English', code: 'ENG-101' });

  // --- Profiles ----------------------------------------------------------------
  const teacher1 = await db.Teacher.create({ userId: teacherUser1.id, department: 'Computer Science' });
  const teacher2 = await db.Teacher.create({ userId: teacherUser2.id, department: 'English' });

  const student1 = await db.Student.create({
    userId: studentUser1.id,
    classId: class10A.id,
    rollNumber: '01',
    phone: '+92 300 1112233',
    address: 'House 12, Street 4, Gulshan-e-Iqbal, Karachi',
    guardianPhone: '+92 300 9998877',
  });

  const student2 = await db.Student.create({
    userId: studentUser2.id,
    classId: class10A.id,
    rollNumber: '02',
    phone: '+92 300 4445566',
    address: 'Flat 6B, Bahadurabad, Karachi',
    guardianPhone: '+92 300 7776655',
  });

  // Same class as the other two, but no results/attendance created for her.
  const student3 = await db.Student.create({
    userId: studentUser3.id,
    classId: class10A.id,
    rollNumber: '03',
    phone: '+92 300 8889900',
    address: 'House 3, Block 2, PECHS, Karachi',
    guardianPhone: '+92 300 6665544',
  });

  // --- Teacher assignments -------------------------------------------------------
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
    { classId: class10A.id, subjectId: csSubject.id, examDate: '2026-08-15', startTime: '10:00:00', durationMinutes: 90, room: 'Hall A' },
    { classId: class10A.id, subjectId: engSubject.id, examDate: '2026-08-18', startTime: '10:00:00', durationMinutes: 90, room: 'Hall A' },
  ]);

  // --- Lecture unit (carried over from Phase 2) ---------------------------------------
  await db.LectureUnit.create({
    teacherId: teacher1.id,
    classId: class10A.id,
    subjectId: csSubject.id,
    title: 'Unit 1: Problem Solving and Algorithms',
    materialType: 'notes',
    filePath: '/uploads/unit1-notes.pdf',
  });

  // --- Teacher upload pending review (carried over from Phase 2) -----------------------
  await db.TeacherUpload.create({
    teacherId: teacher1.id,
    classId: class10A.id,
    subjectId: csSubject.id,
    type: 'result',
    month: '2026-06',
    filePath: '/uploads/june-results.xlsx',
    status: 'pending',
  });

  // --- Results (published, student-visible) ----------------------------------------
  // Two months x two subjects for each of the two "real" students, so
  // Progress has an actual trend line and Results has something to filter.
  await db.Result.bulkCreate([
    { studentId: student1.id, subjectId: csSubject.id, classId: class10A.id, marks: 82, totalMarks: 100, grade: 'A', teacherRemarks: 'Consistent performance throughout the month.', month: '2026-04' },
    { studentId: student1.id, subjectId: csSubject.id, classId: class10A.id, marks: 88, totalMarks: 100, grade: 'A+', teacherRemarks: 'Excellent improvement.', month: '2026-05' },
    { studentId: student1.id, subjectId: engSubject.id, classId: class10A.id, marks: 74, totalMarks: 100, grade: 'B+', teacherRemarks: 'Good vocabulary, work on grammar.', month: '2026-04' },
    { studentId: student1.id, subjectId: engSubject.id, classId: class10A.id, marks: 79, totalMarks: 100, grade: 'A-', teacherRemarks: 'Steady progress.', month: '2026-05' },

    { studentId: student2.id, subjectId: csSubject.id, classId: class10A.id, marks: 91, totalMarks: 100, grade: 'A+', teacherRemarks: 'Outstanding logical thinking.', month: '2026-04' },
    { studentId: student2.id, subjectId: csSubject.id, classId: class10A.id, marks: 85, totalMarks: 100, grade: 'A', teacherRemarks: 'Solid work.', month: '2026-05' },
    { studentId: student2.id, subjectId: engSubject.id, classId: class10A.id, marks: 88, totalMarks: 100, grade: 'A', teacherRemarks: 'Confident writing style.', month: '2026-04' },
    { studentId: student2.id, subjectId: engSubject.id, classId: class10A.id, marks: 92, totalMarks: 100, grade: 'A+', teacherRemarks: 'Excellent essay structure.', month: '2026-05' },
    // student3 (Zara Malik) intentionally has zero Result rows.
  ]);

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
  ]);

  console.log('Seed complete.\n');
  console.log('Test accounts (all use password: Password123!):');
  console.log('  Admin   -> ADM-001 / admin@institute.edu');
  console.log('  Teacher -> TCH-101 / ayesha.khan@institute.edu   (Computer Science)');
  console.log('  Teacher -> TCH-102 / bilal.sheikh@institute.edu  (English)');
  console.log('  Student -> STU-2001 / ali.raza@institute.edu     (has results + attendance)');
  console.log('  Student -> STU-2002 / sara.ahmed@institute.edu   (has results + attendance -- different numbers than Ali)');
  console.log('  Student -> STU-2003 / zara.malik@institute.edu   (no results/attendance -- for testing empty states)');

  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
