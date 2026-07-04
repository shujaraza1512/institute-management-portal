// Populates a few rows across every model so you can see the schema actually
// work end to end. Run with: node seed/seed.js
// NOT for production use — sync({ force: true }) drops and recreates tables.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

const run = async () => {
  // force:true drops and recreates every table, but MySQL enforces FK
  // constraints during DROP TABLE, and Sequelize doesn't always drop tables
  // in dependency order for a schema this interconnected. Disabling checks
  // for just this destructive step (dev/demo seeding only) avoids that.
  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.sequelize.sync({ force: true });
  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await db.User.create({
    name: 'Exam Board Admin',
    email: 'admin@institute.edu',
    instituteId: 'ADM-001',
    password: passwordHash,
    role: 'admin',
  });

  const teacherUser = await db.User.create({
    name: 'Ayesha Khan',
    email: 'ayesha.khan@institute.edu',
    instituteId: 'TCH-101',
    password: passwordHash,
    role: 'teacher',
  });

  const studentUser = await db.User.create({
    name: 'Ali Raza',
    email: 'ali.raza@institute.edu',
    instituteId: 'STU-2001',
    password: passwordHash,
    role: 'student',
  });

  const class10A = await db.Class.create({ name: '10', section: 'A' });
  const csSubject = await db.Subject.create({ name: 'Computer Science', code: 'CS-101' });

  const teacher = await db.Teacher.create({ userId: teacherUser.id, department: 'Computer Science' });
  const student = await db.Student.create({ userId: studentUser.id, classId: class10A.id, rollNumber: '01' });

  await db.TeacherAssignment.create({ teacherId: teacher.id, classId: class10A.id, subjectId: csSubject.id });

  await db.Timetable.create({
    classId: class10A.id,
    subjectId: csSubject.id,
    teacherId: teacher.id,
    day: 'Monday',
    startTime: '09:00:00',
    endTime: '09:45:00',
    room: 'Lab 1',
  });

  await db.PaperSchedule.create({
    classId: class10A.id,
    subjectId: csSubject.id,
    examDate: '2026-08-15',
    startTime: '10:00:00',
    durationMinutes: 90,
    room: 'Hall A',
  });

  await db.LectureUnit.create({
    teacherId: teacher.id,
    classId: class10A.id,
    subjectId: csSubject.id,
    title: 'Unit 1: Problem Solving and Algorithms',
    materialType: 'notes',
    filePath: '/uploads/unit1-notes.pdf',
  });

  await db.TeacherUpload.create({
    teacherId: teacher.id,
    classId: class10A.id,
    subjectId: csSubject.id,
    type: 'result',
    month: '2026-06',
    filePath: '/uploads/june-results.xlsx',
    status: 'pending',
  });

  await db.Result.create({
    studentId: student.id,
    subjectId: csSubject.id,
    classId: class10A.id,
    marks: 82,
    totalMarks: 100,
    grade: 'A',
    teacherRemarks: 'Consistent performance throughout the month.',
    month: '2026-05',
  });

  await db.Announcement.create({
    title: 'Monthly Test Schedule Released',
    description: 'Check the Paper Schedule page for the August exam dates.',
    audience: 'all',
    postedBy: admin.id,
  });

  console.log('Seed complete.\n');

  const result = await db.Result.findOne({
    include: [
      { model: db.Student, as: 'student', include: [{ model: db.User, as: 'user' }] },
      { model: db.Subject, as: 'subject' },
    ],
  });

  console.log('Sample Result row (with the virtual `percentage` field computed on read):');
  console.log({
    student: result.student.user.name,
    subject: result.subject.name,
    marks: result.marks,
    totalMarks: result.totalMarks,
    percentage: result.percentage,
    grade: result.grade,
    month: result.month,
  });

  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
