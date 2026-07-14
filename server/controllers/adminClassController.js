const db = require('../models');

const shapeClass = (c) => ({
  id: c.id,
  name: c.name,
  section: c.section,
  classTeacherId: c.classTeacherId,
  classTeacher: c.classTeacher ? c.classTeacher.user.name : null,
  studentCount: c.students ? c.students.length : 0,
});

const getClasses = async (req, res, next) => {
  try {
    const classes = await db.Class.findAll({
      include: [
        { model: db.Teacher, as: 'classTeacher', include: [{ model: db.User, as: 'user' }] },
        { model: db.Student, as: 'students', attributes: ['id'] },
      ],
      order: [['name', 'ASC'], ['section', 'ASC']],
    });

    res.json({ success: true, data: classes.map(shapeClass) });
  } catch (err) {
    next(err);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, section, classTeacherId } = req.body;
    const newClass = await db.Class.create({ name, section, classTeacherId: classTeacherId || null });
    res.status(201).json({ success: true, message: 'Class created.', data: { id: newClass.id } });
  } catch (err) {
    next(err);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const existingClass = await db.Class.findByPk(req.params.id);
    if (!existingClass) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    const { name, section, classTeacherId } = req.body;
    if (name !== undefined) existingClass.name = name;
    if (section !== undefined) existingClass.section = section;
    if (classTeacherId !== undefined) existingClass.classTeacherId = classTeacherId || null;
    await existingClass.save();

    res.json({ success: true, message: 'Class updated.' });
  } catch (err) {
    next(err);
  }
};

// Blocked if students are still enrolled -- deleting a class out from under
// its students would leave them with a dangling classId. Reassign/remove
// students first, matching how the deleteSubject/deleteTeacher guards work.
const deleteClass = async (req, res, next) => {
  try {
    const existingClass = await db.Class.findByPk(req.params.id);
    if (!existingClass) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    const studentCount = await db.Student.count({ where: { classId: existingClass.id } });
    if (studentCount > 0) {
      return res.status(409).json({ success: false, message: 'This class still has students enrolled. Reassign them before deleting.' });
    }

    await db.TeacherAssignment.destroy({ where: { classId: existingClass.id } });
    await db.Timetable.destroy({ where: { classId: existingClass.id } });
    await db.PaperSchedule.destroy({ where: { classId: existingClass.id } });
    await existingClass.destroy();

    res.json({ success: true, message: 'Class deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };
