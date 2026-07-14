const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const todayName = () => DAY_ORDER[new Date().getDay() - 1]; // undefined on Sunday -- no Sunday entries exist

// --- Dashboard ---------------------------------------------------------------
const getDashboard = async (req, res, next) => {
  try {
    const teacher = req.teacher;

    const assignments = await db.TeacherAssignment.findAll({
      where: { teacherId: teacher.id },
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Subject, as: 'subject' },
      ],
    });

    const classIds = Array.from(new Set(assignments.map((a) => a.classId)));
    const subjectNames = Array.from(new Set(assignments.map((a) => a.subject.name)));

    const totalStudents = classIds.length
      ? await db.Student.count({ where: { classId: { [Op.in]: classIds } } })
      : 0;

    const today = todayName();
    const todaysLectures = today
      ? await db.Timetable.count({ where: { teacherId: teacher.id, day: today } })
      : 0;

    const pendingResultUploads = await db.Result.count({
      where: { createdBy: req.user.id, status: 'pending' },
    });

    const recentAnnouncements = await db.Announcement.findAll({
      where: {
        audience: { [Op.in]: ['all', 'teachers'] },
        publishAt: { [Op.lte]: new Date() },
        [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gte]: new Date() } }],
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        teacher: {
          name: teacher.user.name,
          instituteId: teacher.user.instituteId,
          assignedSubjects: subjectNames,
        },
        assignedClassesCount: classIds.length,
        totalStudents,
        todaysLectures,
        pendingResultUploads,
        recentAnnouncements: recentAnnouncements.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          date: a.createdAt,
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
    const teacher = req.teacher;

    const assignments = await db.TeacherAssignment.findAll({
      where: { teacherId: teacher.id },
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Subject, as: 'subject' },
      ],
    });

    const classNames = Array.from(new Set(assignments.map((a) => `${a.class.name}-${a.class.section}`)));
    const subjectNames = Array.from(new Set(assignments.map((a) => a.subject.name)));

    res.json({
      success: true,
      data: {
        name: teacher.user.name,
        email: teacher.user.email,
        instituteId: teacher.user.instituteId,
        department: teacher.department,
        phone: teacher.phone,
        assignedClasses: classNames,
        assignedSubjects: subjectNames,
      },
    });
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

// --- Timetable ---------------------------------------------------------------
// A teacher's timetable spans every class they teach, not just one -- unlike
// Student's timetable (scoped to a single classId), this is scoped to teacherId.
const getTimetable = async (req, res, next) => {
  try {
    const teacher = req.teacher;

    const entries = await db.Timetable.findAll({
      where: { teacherId: teacher.id },
      include: [
        { model: db.Subject, as: 'subject' },
        { model: db.Class, as: 'class' },
      ],
    });

    const sorted = entries
      .map((e) => ({
        id: e.id,
        day: e.day,
        startTime: e.startTime,
        endTime: e.endTime,
        subject: e.subject.name,
        class: `${e.class.name}-${e.class.section}`,
        room: e.room,
      }))
      .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.startTime.localeCompare(b.startTime));

    res.json({ success: true, data: sorted });
  } catch (err) {
    next(err);
  }
};

// --- Announcements ---------------------------------------------------------------
const getAnnouncements = async (req, res, next) => {
  try {
    const now = new Date();
    const announcements = await db.Announcement.findAll({
      where: {
        audience: { [Op.in]: ['all', 'teachers'] },
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

// --- Assigned classes/subjects -------------------------------------------------
// Not a page of its own -- this is the data source the Results/Assignments/
// Lecture Materials forms use to populate their class + subject dropdowns.
const getAssignedClasses = async (req, res, next) => {
  try {
    const assignments = await db.TeacherAssignment.findAll({
      where: { teacherId: req.teacher.id },
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Subject, as: 'subject' },
      ],
    });

    const byClass = {};
    assignments.forEach((a) => {
      if (!byClass[a.classId]) {
        byClass[a.classId] = { classId: a.classId, className: `${a.class.name}-${a.class.section}`, subjects: [] };
      }
      byClass[a.classId].subjects.push({ id: a.subjectId, name: a.subject.name });
    });

    res.json({ success: true, data: Object.values(byClass) });
  } catch (err) {
    next(err);
  }
};

// --- Students across assigned classes (Phase 7.5) -------------------------------------------------
// Data source for the new Result Submission Form's Student dropdown: every
// student in every class this teacher is assigned to, regardless of
// subject (the Subject dropdown is a separate, class-scoped choice on the
// frontend, cross-referenced against getAssignedClasses above).
const getMyStudents = async (req, res, next) => {
  try {
    const assignments = await db.TeacherAssignment.findAll({
      where: { teacherId: req.teacher.id },
      attributes: ['classId'],
    });
    const classIds = Array.from(new Set(assignments.map((a) => a.classId)));

    if (!classIds.length) {
      return res.json({ success: true, data: [] });
    }

    const students = await db.Student.findAll({
      where: { classId: { [Op.in]: classIds } },
      include: [
        { model: db.User, as: 'user' },
        { model: db.Class, as: 'class' },
      ],
      order: [['rollNumber', 'ASC']],
    });

    res.json({
      success: true,
      data: students.map((s) => ({
        id: s.id,
        name: s.user.name,
        rollNumber: s.rollNumber,
        instituteId: s.user.instituteId,
        classId: s.classId,
        className: `${s.class.name}-${s.class.section}`,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getProfile,
  changePassword,
  getTimetable,
  getAnnouncements,
  getAssignedClasses,
  getMyStudents,
};
