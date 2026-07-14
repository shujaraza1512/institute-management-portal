const db = require('../models');

const shapeSubject = (s) => ({
  id: s.id,
  name: s.name,
  code: s.code,
  assignedTeachers: s.teacherAssignments
    ? Array.from(new Set(s.teacherAssignments.map((a) => a.teacher.user.name)))
    : [],
});

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await db.Subject.findAll({
      include: [
        {
          model: db.TeacherAssignment,
          as: 'teacherAssignments',
          include: [{ model: db.Teacher, as: 'teacher', include: [{ model: db.User, as: 'user' }] }],
        },
      ],
      order: [['name', 'ASC']],
    });

    res.json({ success: true, data: subjects.map(shapeSubject) });
  } catch (err) {
    next(err);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const subject = await db.Subject.create({ name, code });
    res.status(201).json({ success: true, message: 'Subject created.', data: { id: subject.id } });
  } catch (err) {
    next(err);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await db.Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const { name, code } = req.body;
    if (name !== undefined) subject.name = name;
    if (code !== undefined) subject.code = code;
    await subject.save();

    res.json({ success: true, message: 'Subject updated.' });
  } catch (err) {
    next(err);
  }
};

// Blocked if any Result/TeacherAssignment references this subject --
// deleting it would orphan academic records across the board. Editing the
// subject's name/code is always safe and doesn't require this check.
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await db.Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const [resultCount, assignmentCount] = await Promise.all([
      db.Result.count({ where: { subjectId: subject.id } }),
      db.TeacherAssignment.count({ where: { subjectId: subject.id } }),
    ]);

    if (resultCount || assignmentCount) {
      return res.status(409).json({
        success: false,
        message: 'This subject has existing results or teacher assignments and cannot be deleted.',
      });
    }

    await subject.destroy();
    res.json({ success: true, message: 'Subject deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
