const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');
const { calculateGrade } = db.Result;

const shapeStudent = (s) => ({
  id: s.id,
  name: s.user.name,
  email: s.user.email,
  instituteId: s.user.instituteId,
  isActive: s.user.isActive,
  rollNumber: s.rollNumber,
  phone: s.phone,
  guardianName: s.guardianName,
  guardianPhone: s.guardianPhone,
  address: s.address,
  admissionDate: s.admissionDate,
  classId: s.classId,
  class: s.class ? `${s.class.name}-${s.class.section}` : null,
});

// --- List / search ---------------------------------------------------------
const getStudents = async (req, res, next) => {
  try {
    const { search, classId, status } = req.query;

    const students = await db.Student.findAll({
      where: classId && !search ? { classId } : {},
      include: [{ model: db.User, as: 'user' }, { model: db.Class, as: 'class' }],
      order: [['id', 'ASC']],
    });

    let filtered = students;
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.user.name.toLowerCase().includes(term) ||
          s.user.instituteId.toLowerCase().includes(term) ||
          (s.rollNumber || '').toLowerCase().includes(term)
      );
      if (classId) filtered = filtered.filter((s) => s.classId === parseInt(classId, 10));
    }
    if (status === 'active') filtered = filtered.filter((s) => s.user.isActive);
    if (status === 'inactive') filtered = filtered.filter((s) => !s.user.isActive);

    res.json({ success: true, data: filtered.map(shapeStudent) });
  } catch (err) {
    next(err);
  }
};

// --- Create ---------------------------------------------------------------------
const createStudent = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { name, email, instituteId, password, rollNumber, phone, guardianName, guardianPhone, address, classId, admissionDate } = req.body;

    const user = await db.User.create(
      { name, email, instituteId, password: await bcrypt.hash(password, 10), role: 'student' },
      { transaction: t }
    );

    const student = await db.Student.create(
      {
        userId: user.id,
        classId: classId || null,
        rollNumber,
        phone,
        guardianName,
        guardianPhone,
        address,
        admissionDate: admissionDate || new Date().toISOString().slice(0, 10),
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ success: true, message: 'Student created.', data: { id: student.id } });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// --- Update ---------------------------------------------------------------------
const updateStudent = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const student = await db.Student.findByPk(req.params.id, { include: [{ model: db.User, as: 'user' }] });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const { name, email, instituteId, rollNumber, phone, guardianName, guardianPhone, address, classId, admissionDate } = req.body;

    if (name !== undefined) student.user.name = name;
    if (email !== undefined) student.user.email = email;
    if (instituteId !== undefined) student.user.instituteId = instituteId;
    await student.user.save({ transaction: t });

    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (phone !== undefined) student.phone = phone;
    if (guardianName !== undefined) student.guardianName = guardianName;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
    if (address !== undefined) student.address = address;
    if (classId !== undefined) student.classId = classId;
    if (admissionDate !== undefined) student.admissionDate = admissionDate;
    await student.save({ transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Student updated.' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// --- Activate / deactivate ---------------------------------------------------------------------
const setStudentStatus = async (req, res, next) => {
  try {
    const student = await db.Student.findByPk(req.params.id, { include: [{ model: db.User, as: 'user' }] });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    student.user.isActive = !!req.body.isActive;
    await student.user.save();

    res.json({ success: true, message: `Student ${student.user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    next(err);
  }
};

// --- Delete ---------------------------------------------------------------------
// A hard delete, distinct from deactivate. A student's own data (Results,
// Attendance) has nothing else referencing it, so cascading here is safe --
// unlike Teacher/Class/Subject, which are left blocked-if-referenced (see
// their controllers) since their downstream data is shared/institutional.
const deleteStudent = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const student = await db.Student.findByPk(req.params.id);
    if (!student) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await db.Result.destroy({ where: { studentId: student.id }, transaction: t });
    await db.Attendance.destroy({ where: { studentId: student.id }, transaction: t });
    // Deleting the User cascades to delete the Student row too (onDelete:
    // CASCADE was set on that association back in Phase 2).
    await db.User.destroy({ where: { id: student.userId }, transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Student deleted.' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// --- Detailed report ---------------------------------------------------------------------
const getStudentReport = async (req, res, next) => {
  try {
    const student = await db.Student.findByPk(req.params.id, {
      include: [
        { model: db.User, as: 'user' },
        { model: db.Class, as: 'class' },
      ],
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const { month, subjectId, session } = req.query;

    // Complete assessment history -- every status, not just approved, since
    // this is an admin-only audit view (unlike the student's own Phase 5 view).
    const historyWhere = { studentId: student.id };
    if (month) historyWhere.month = month;
    if (subjectId) historyWhere.subjectId = subjectId;
    if (session) {
      // Derived filter: no AcademicYear/session concept exists in this
      // schema, so a session like "2025-2026" is approximated from the
      // month string using a standard Jul-Jun academic calendar.
      const [startYear] = session.split('-');
      const sessionMonths = [];
      for (let m = 7; m <= 12; m++) sessionMonths.push(`${startYear}-${String(m).padStart(2, '0')}`);
      for (let m = 1; m <= 6; m++) sessionMonths.push(`${Number(startYear) + 1}-${String(m).padStart(2, '0')}`);
      historyWhere.month = { [Op.in]: sessionMonths };
    }

    const allResults = await db.Result.findAll({
      where: historyWhere,
      include: [{ model: db.Subject, as: 'subject' }, { model: db.User, as: 'creator' }, { model: db.User, as: 'reviewer' }],
      order: [['month', 'DESC']],
    });

    const positionCache = {};
    const assessmentHistory = await Promise.all(
      allResults.map(async (r) => {
        let position = null;
        if (r.status === 'approved') {
          const cacheKey = `${r.classId}-${r.subjectId}-${r.month}-${r.examType}`;
          if (positionCache[cacheKey] === undefined) {
            positionCache[cacheKey] = await db.Result.count({
              where: { classId: r.classId, subjectId: r.subjectId, month: r.month, examType: r.examType, status: 'approved', marks: { [Op.gt]: r.marks } },
            });
          }
          position = positionCache[cacheKey] + 1;
        }
        return {
          id: r.id,
          assessmentName: `${r.subject.name} — ${r.examType} — ${r.month}`,
          subject: r.subject.name,
          examType: r.examType,
          teacher: r.creator ? r.creator.name : null,
          month: r.month,
          marks: r.marks,
          totalMarks: r.totalMarks,
          percentage: r.percentage,
          grade: r.grade,
          position,
          teacherRemarks: r.teacherRemarks,
          status: r.status,
          // Approval history -- who on the Examination Board reviewed this,
          // when, and (for a rejection) why. Only meaningful once a review
          // has actually happened, hence the null guard rather than
          // always-present empty fields.
          approvalHistory: r.reviewedBy
            ? { reviewedBy: r.reviewer ? r.reviewer.name : null, reviewedAt: r.reviewedAt, rejectionReason: r.rejectionReason }
            : null,
        };
      })
    );

    // Academic progress / performance summary -- approved results only,
    // matching what the student themselves would officially see (Phase 5).
    const approved = allResults.filter((r) => r.status === 'approved');
    const pct = (r) => parseFloat(r.percentage);

    const byMonth = {};
    const bySubject = {};
    approved.forEach((r) => {
      if (!byMonth[r.month]) byMonth[r.month] = [];
      byMonth[r.month].push(pct(r));
      if (!bySubject[r.subject.name]) bySubject[r.subject.name] = [];
      bySubject[r.subject.name].push(pct(r));
    });
    const average = (arr) => Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;

    const monthlyTrend = Object.entries(byMonth)
      .map(([m, pcts]) => ({ month: m, average: average(pcts) }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const subjectComparison = Object.entries(bySubject).map(([subject, pcts]) => ({ subject, average: average(pcts) }));

    const allPercentages = approved.map(pct);
    const overallAverage = allPercentages.length ? average(allPercentages) : null;
    const highestMarks = allPercentages.length ? Math.max(...allPercentages) : null;
    const lowestMarks = allPercentages.length ? Math.min(...allPercentages) : null;

    const passedSubjects = subjectComparison.filter((s) => s.average >= 40).map((s) => s.subject);
    const failedSubjects = subjectComparison.filter((s) => s.average < 40).map((s) => s.subject);
    const bestSubject = subjectComparison.length ? subjectComparison.reduce((a, b) => (b.average > a.average ? b : a)) : null;
    const weakestSubject = subjectComparison.length ? subjectComparison.reduce((a, b) => (b.average < a.average ? b : a)) : null;

    // Attendance
    const attendanceRows = await db.Attendance.findAll({ where: { studentId: student.id }, order: [['date', 'DESC']] });
    const attendanceByMonth = {};
    attendanceRows.forEach((a) => {
      const m = a.date.slice(0, 7);
      if (!attendanceByMonth[m]) attendanceByMonth[m] = { present: 0, absent: 0, leave: 0 };
      attendanceByMonth[m][a.status] += 1;
    });
    const attendanceTrend = Object.entries(attendanceByMonth)
      .map(([m, counts]) => {
        const total = counts.present + counts.absent + counts.leave;
        return { month: m, percentage: total ? Math.round((counts.present / total) * 10000) / 100 : null };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    // Day-by-day log -- distinct from the monthly trend above, which only
    // gives a percentage per month. "View attendance history" (Phase 7.5)
    // means the actual per-day record, not just the aggregate.
    const attendanceHistory = attendanceRows.map((a) => ({ date: a.date, status: a.status }));

    const totalPresent = attendanceRows.filter((a) => a.status === 'present').length;
    const totalAbsent = attendanceRows.filter((a) => a.status === 'absent').length;
    const totalLeave = attendanceRows.filter((a) => a.status === 'leave').length;
    const overallAttendancePercentage = attendanceRows.length ? Math.round((totalPresent / attendanceRows.length) * 10000) / 100 : null;

    res.json({
      success: true,
      data: {
        student: shapeStudent(student),
        assessmentHistory,
        progress: {
          monthlyTrend,
          subjectComparison,
          overallAverage,
          highestMarks,
          lowestMarks,
        },
        attendance: {
          overallPercentage: overallAttendancePercentage,
          present: totalPresent,
          absent: totalAbsent,
          leave: totalLeave,
          monthlyTrend: attendanceTrend,
          history: attendanceHistory,
        },
        performanceSummary: {
          overallPercentage: overallAverage,
          averageGrade: overallAverage !== null ? calculateGrade(overallAverage, 100) : null,
          totalAssessments: approved.length,
          passedSubjects,
          failedSubjects,
          bestSubject: bestSubject ? bestSubject.subject : null,
          weakestSubject: weakestSubject ? weakestSubject.subject : null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudents, createStudent, updateStudent, setStudentStatus, deleteStudent, getStudentReport };
