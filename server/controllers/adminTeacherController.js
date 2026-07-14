const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');

const shapeTeacher = (t) => ({
  id: t.id,
  name: t.user.name,
  email: t.user.email,
  instituteId: t.user.instituteId,
  isActive: t.user.isActive,
  phone: t.phone,
  qualification: t.qualification,
  department: t.department,
  subjects: t.assignments ? Array.from(new Set(t.assignments.map((a) => a.subject.name))) : [],
  classes: t.assignments ? Array.from(new Set(t.assignments.map((a) => `${a.class.name}-${a.class.section}`))) : [],
});

const includeAssignments = [
  { model: db.User, as: 'user' },
  {
    model: db.TeacherAssignment,
    as: 'assignments',
    include: [
      { model: db.Class, as: 'class' },
      { model: db.Subject, as: 'subject' },
    ],
  },
];

// --- List / search ---------------------------------------------------------
const getTeachers = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const teachers = await db.Teacher.findAll({ include: includeAssignments, order: [['id', 'ASC']] });

    let filtered = teachers;
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((t) => t.user.name.toLowerCase().includes(term) || t.user.instituteId.toLowerCase().includes(term));
    }
    if (status === 'active') filtered = filtered.filter((t) => t.user.isActive);
    if (status === 'inactive') filtered = filtered.filter((t) => !t.user.isActive);

    res.json({ success: true, data: filtered.map(shapeTeacher) });
  } catch (err) {
    next(err);
  }
};

// --- Create ---------------------------------------------------------------------
const createTeacher = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { name, email, instituteId, password, phone, qualification, department } = req.body;

    const user = await db.User.create(
      { name, email, instituteId, password: await bcrypt.hash(password, 10), role: 'teacher' },
      { transaction: t }
    );

    const teacher = await db.Teacher.create({ userId: user.id, phone, qualification, department }, { transaction: t });

    await t.commit();
    res.status(201).json({ success: true, message: 'Teacher created.', data: { id: teacher.id } });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// --- Update ---------------------------------------------------------------------
const updateTeacher = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const teacher = await db.Teacher.findByPk(req.params.id, { include: [{ model: db.User, as: 'user' }] });
    if (!teacher) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const { name, email, instituteId, phone, qualification, department } = req.body;

    if (name !== undefined) teacher.user.name = name;
    if (email !== undefined) teacher.user.email = email;
    if (instituteId !== undefined) teacher.user.instituteId = instituteId;
    await teacher.user.save({ transaction: t });

    if (phone !== undefined) teacher.phone = phone;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (department !== undefined) teacher.department = department;
    await teacher.save({ transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Teacher updated.' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// --- Get current assignments (for pre-populating the assign checklist) ---------------------------------------
const getAssignments = async (req, res, next) => {
  try {
    const teacher = await db.Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }
    const assignments = await db.TeacherAssignment.findAll({ where: { teacherId: teacher.id } });
    res.json({ success: true, data: assignments.map((a) => ({ classId: a.classId, subjectId: a.subjectId })) });
  } catch (err) {
    next(err);
  }
};

// --- Assign subjects/classes ---------------------------------------------------------------------
// Replaces the full set of this teacher's assignments with exactly the list
// given -- simpler and less error-prone for an admin UI (a checklist of
// class+subject pairs) than diffing adds/removes individually.
const setAssignments = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const teacher = await db.Teacher.findByPk(req.params.id);
    if (!teacher) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const { assignments } = req.body; // [{ classId, subjectId }, ...]
    if (!Array.isArray(assignments)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'assignments must be an array of { classId, subjectId }.' });
    }

    await db.TeacherAssignment.destroy({ where: { teacherId: teacher.id }, transaction: t });
    if (assignments.length) {
      await db.TeacherAssignment.bulkCreate(
        assignments.map((a) => ({ teacherId: teacher.id, classId: a.classId, subjectId: a.subjectId })),
        { transaction: t }
      );
    }

    await t.commit();
    res.json({ success: true, message: 'Teacher assignments updated.' });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// --- Activate / deactivate ---------------------------------------------------------------------
const setTeacherStatus = async (req, res, next) => {
  try {
    const teacher = await db.Teacher.findByPk(req.params.id, { include: [{ model: db.User, as: 'user' }] });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    teacher.user.isActive = !!req.body.isActive;
    await teacher.user.save();

    res.json({ success: true, message: `Teacher ${teacher.user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    next(err);
  }
};

// --- Delete ---------------------------------------------------------------------
// Blocked if this teacher has ever created a Result, Assignment, or Lecture
// Material -- deleting them would either orphan that data or silently erase
// academic records. Deactivate is the safe path for a teacher who's left;
// delete is only for a mistakenly-created account with no real activity yet.
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await db.Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const [resultCount, assignmentCount, materialCount] = await Promise.all([
      db.Result.count({ where: { createdBy: teacher.userId } }),
      db.Assignment.count({ where: { teacherId: teacher.id } }),
      db.LectureUnit.count({ where: { teacherId: teacher.id } }),
    ]);

    if (resultCount || assignmentCount || materialCount) {
      return res.status(409).json({
        success: false,
        message: 'This teacher has existing results, assignments, or lecture materials and cannot be deleted. Deactivate the account instead.',
      });
    }

    await db.TeacherAssignment.destroy({ where: { teacherId: teacher.id } });
    await db.User.destroy({ where: { id: teacher.userId } }); // cascades to the Teacher row

    res.json({ success: true, message: 'Teacher deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTeachers, getAssignments, createTeacher, updateTeacher, setAssignments, setTeacherStatus, deleteTeacher };
