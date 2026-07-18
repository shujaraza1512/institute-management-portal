const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const percentOf = (marks, totalMarks) => (parseFloat(marks) / parseFloat(totalMarks)) * 100;
const round2 = (n) => Math.round(n * 100) / 100;

// --- Dashboard ---------------------------------------------------------------
// One composed endpoint rather than 4-5 separate calls, so the dashboard has
// a single loading state instead of juggling several in-flight requests.
const getDashboard = async (req, res, next) => {
  try {
    const student = req.student;
    const classId = student.classId;
    const today = new Date().toISOString().slice(0, 10);

    const [
      teacherAssignments,
      upcomingExam,
      latestResult,
      announcementsCount,
      attendanceRows,
      allResults,
      recentHomeworkAssignments,
      recentLectureMaterials,
    ] = await Promise.all([
      classId ? db.TeacherAssignment.findAll({ where: { classId }, attributes: ['subjectId'] }) : [],
      classId
        ? db.PaperSchedule.findOne({
            where: { classId, examDate: { [Op.gte]: today } },
            order: [['examDate', 'ASC']],
            include: [{ model: db.Subject, as: 'subject' }],
          })
        : null,
      db.Result.findOne({
        where: { studentId: student.id, status: 'approved' },
        order: [['month', 'DESC']],
        include: [{ model: db.Subject, as: 'subject' }],
      }),
      db.Announcement.count({
        where: {
          audience: { [Op.in]: ['all', 'students'] },
          publishAt: { [Op.lte]: new Date() },
          [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gte]: new Date() } }],
        },
      }),
      db.Attendance.findAll({ where: { studentId: student.id }, attributes: ['status'] }),
      db.Result.findAll({ where: { studentId: student.id, status: 'approved' }, attributes: ['marks', 'totalMarks'] }),
      // Added in Phase 7.5 for the "Recent Assignments" dashboard card.
      classId
        ? db.Assignment.findAll({
            where: { classId },
            include: [{ model: db.Subject, as: 'subject' }],
            order: [['createdAt', 'DESC']],
            limit: 3,
          })
        : [],
      // Added in Phase 7.5 for the "Recent Lecture Materials" dashboard card.
      classId
        ? db.LectureUnit.findAll({
            where: { classId },
            include: [{ model: db.Subject, as: 'subject' }],
            order: [['createdAt', 'DESC']],
            limit: 3,
          })
        : [],
    ]);

    const subjectsCount = new Set(teacherAssignments.map((a) => a.subjectId)).size;

    const attendancePercentage = attendanceRows.length
      ? round2((attendanceRows.filter((a) => a.status === 'present').length / attendanceRows.length) * 100)
      : null;

    const overallAverage = allResults.length
      ? round2(allResults.reduce((sum, r) => sum + percentOf(r.marks, r.totalMarks), 0) / allResults.length)
      : null;

    res.json({
      success: true,
      data: {
        student: {
          name: student.user.name,
          instituteId: student.user.instituteId,
          class: student.class ? `${student.class.name}-${student.class.section}` : null,
        },
        attendancePercentage,
        overallAverage,
        subjectsCount,
        upcomingExam: upcomingExam
          ? {
              subject: upcomingExam.subject.name,
              date: upcomingExam.examDate,
              time: upcomingExam.startTime,
              room: upcomingExam.room,
            }
          : null,
        latestResult: latestResult
          ? {
              subject: latestResult.subject.name,
              marks: latestResult.marks,
              totalMarks: latestResult.totalMarks,
              percentage: latestResult.percentage,
              grade: latestResult.grade,
              month: latestResult.month,
            }
          : null,
        announcementsCount,
        // Added in Phase 7.5 -- dashboard extension, existing cards unchanged.
        recentAssignments: recentHomeworkAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subject: a.subject.name,
          dueDate: a.dueDate,
        })),
        recentLectureMaterials: recentLectureMaterials.map((m) => ({
          id: m.id,
          title: m.title,
          subject: m.subject.name,
          uploadedAt: m.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// --- Profile -------------------------------------------------------------------
const getProfile = async (req, res, next) => {
  try {
    const student = req.student;
    res.json({
      success: true,
      data: {
        name: student.user.name,
        email: student.user.email,
        instituteId: student.user.instituteId,
        rollNumber: student.rollNumber,
        phone: student.phone,
        address: student.address,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        photoUrl: student.photoUrl,
        class: student.class ? { name: student.class.name, section: student.class.section } : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// --- Self-service profile edit (Phase 8) ---------------------------------------
// Deliberately narrow: a student can update their own contact details, but
// not their name/email/Institute ID/class/roll number -- those stay
// admin-managed (Phase 7's Student Management), consistent with the
// original spec's RBAC boundaries. This only fills in the "Edit profile /
// Save changes" capability the Profile page was missing; it doesn't change
// who can touch what.
const updateProfile = async (req, res, next) => {
  try {
    const student = req.student;
    const { phone, address, guardianName, guardianPhone } = req.body;

    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;
    if (guardianName !== undefined) student.guardianName = guardianName;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
    await student.save();

    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await db.User.findByPk(req.user.id);
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// --- Results ---------------------------------------------------------------------
const getResults = async (req, res, next) => {
  try {
    const student = req.student;
    const { month } = req.query;

    const where = { studentId: student.id, status: 'approved' };
    if (month) where.month = month;

    const results = await db.Result.findAll({
      where,
      include: [{ model: db.Subject, as: 'subject' }],
      order: [['month', 'DESC']],
    });

    // Class rank for that subject+month — computed on read (not stored),
    // since it depends on every classmate's marks and would go stale the
    // moment any of them changed. Only approved results count toward rank.
    const withPosition = await Promise.all(
      results.map(async (r) => {
        const higherCount = await db.Result.count({
          where: { classId: r.classId, subjectId: r.subjectId, month: r.month, examType: r.examType, status: 'approved', marks: { [Op.gt]: r.marks } },
        });
        return {
          id: r.id,
          subject: r.subject.name,
          examType: r.examType,
          marks: r.marks,
          totalMarks: r.totalMarks,
          percentage: r.percentage,
          grade: r.grade,
          month: r.month,
          teacherRemarks: r.teacherRemarks,
          position: higherCount + 1,
        };
      })
    );

    res.json({ success: true, data: withPosition });
  } catch (err) {
    next(err);
  }
};

// --- Progress ---------------------------------------------------------------------
const getProgress = async (req, res, next) => {
  try {
    const student = req.student;
    const results = await db.Result.findAll({
      where: { studentId: student.id, status: 'approved' },
      include: [{ model: db.Subject, as: 'subject' }],
      order: [['month', 'ASC']],
    });

    const byMonth = {};
    const bySubject = {};
    results.forEach((r) => {
      const pct = percentOf(r.marks, r.totalMarks);
      if (!byMonth[r.month]) byMonth[r.month] = [];
      byMonth[r.month].push(pct);
      if (!bySubject[r.subject.name]) bySubject[r.subject.name] = [];
      bySubject[r.subject.name].push(pct);
    });

    const average = (arr) => round2(arr.reduce((a, b) => a + b, 0) / arr.length);

    const monthlyTrend = Object.entries(byMonth)
      .map(([month, pcts]) => ({ month, average: average(pcts) }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const subjectPerformance = Object.entries(bySubject).map(([subject, pcts]) => ({
      subject,
      average: average(pcts),
    }));

    const overallAverage = results.length
      ? round2(results.reduce((sum, r) => sum + percentOf(r.marks, r.totalMarks), 0) / results.length)
      : null;

    res.json({ success: true, data: { monthlyTrend, subjectPerformance, overallAverage } });
  } catch (err) {
    next(err);
  }
};

// --- Timetable ---------------------------------------------------------------------
const getTimetable = async (req, res, next) => {
  try {
    const student = req.student;
    if (!student.classId) {
      return res.json({ success: true, data: [] });
    }

    const entries = await db.Timetable.findAll({
      where: { classId: student.classId },
      include: [
        { model: db.Subject, as: 'subject' },
        { model: db.Teacher, as: 'teacher', include: [{ model: db.User, as: 'user' }] },
      ],
    });

    const sorted = entries
      .map((e) => ({
        id: e.id,
        day: e.day,
        startTime: e.startTime,
        endTime: e.endTime,
        subject: e.subject.name,
        teacher: e.teacher.user.name,
        room: e.room,
      }))
      .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.startTime.localeCompare(b.startTime));

    res.json({ success: true, data: sorted });
  } catch (err) {
    next(err);
  }
};

// --- Paper schedule ---------------------------------------------------------------------
const getPaperSchedule = async (req, res, next) => {
  try {
    const student = req.student;
    if (!student.classId) {
      return res.json({ success: true, data: [] });
    }

    const today = new Date().toISOString().slice(0, 10);
    const entries = await db.PaperSchedule.findAll({
      where: { classId: student.classId, examDate: { [Op.gte]: today } },
      include: [{ model: db.Subject, as: 'subject' }],
      order: [['examDate', 'ASC']],
    });

    res.json({
      success: true,
      data: entries.map((e) => ({
        id: e.id,
        subject: e.subject.name,
        date: e.examDate,
        time: e.startTime,
        durationMinutes: e.durationMinutes,
        room: e.room,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// --- Announcements ---------------------------------------------------------------------
const getAnnouncements = async (req, res, next) => {
  try {
    const now = new Date();
    const announcements = await db.Announcement.findAll({
      where: {
        audience: { [Op.in]: ['all', 'students'] },
        publishAt: { [Op.lte]: now },
        [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gte]: now } }],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: announcements.map((a) => ({ id: a.id, title: a.title, description: a.description, date: a.createdAt })),
    });
  } catch (err) {
    next(err);
  }
};

// --- Assignments (added Phase 6) ---------------------------------------------------------------
// Read-only, scoped to the student's own class -- never accepts a classId
// from the client, same pattern as every other endpoint in this file.
const getAssignments = async (req, res, next) => {
  try {
    const student = req.student;
    if (!student.classId) {
      return res.json({ success: true, data: [] });
    }

    const assignments = await db.Assignment.findAll({
      where: { classId: student.classId },
      include: [
        { model: db.Subject, as: 'subject' },
        { model: db.Teacher, as: 'teacher', include: [{ model: db.User, as: 'user' }] },
      ],
      order: [['createdAt', 'DESC']], // newest first, per Phase 7.5 spec -- distinct from due date
    });

    const today = new Date().toISOString().slice(0, 10);
    res.json({
      success: true,
      data: assignments.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        subject: a.subject.name,
        teacher: a.teacher.user.name,
        postedDate: a.createdAt,
        dueDate: a.dueDate,
        hasAttachment: !!a.attachmentPath,
        status: a.dueDate >= today ? 'active' : 'expired',
      })),
    });
  } catch (err) {
    next(err);
  }
};

// --- Lecture materials (added Phase 6) ---------------------------------------------------------------
const getLectureMaterials = async (req, res, next) => {
  try {
    const student = req.student;
    if (!student.classId) {
      return res.json({ success: true, data: [] });
    }

    const materials = await db.LectureUnit.findAll({
      where: { classId: student.classId },
      include: [
        { model: db.Subject, as: 'subject' },
        { model: db.Teacher, as: 'teacher', include: [{ model: db.User, as: 'user' }] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: materials.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        materialType: m.materialType,
        subject: m.subject.name,
        teacher: m.teacher.user.name,
        hasFile: !!m.filePath,
        externalLink: m.externalLink,
        uploadedAt: m.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  changePassword,
  getResults,
  getProgress,
  getTimetable,
  getPaperSchedule,
  getAnnouncements,
  getAssignments,
  getLectureMaterials,
};
