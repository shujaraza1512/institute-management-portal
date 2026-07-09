const db = require('../models');

const verifyAssignment = async (teacherId, classId, subjectId) => {
  const assignment = await db.TeacherAssignment.findOne({ where: { teacherId, classId, subjectId } });
  return !!assignment;
};

const shape = (a) => ({
  id: a.id,
  title: a.title,
  description: a.description,
  dueDate: a.dueDate,
  class: `${a.class.name}-${a.class.section}`,
  classId: a.classId,
  subject: a.subject.name,
  subjectId: a.subjectId,
  hasAttachment: !!a.attachmentPath,
});

const getAssignments = async (req, res, next) => {
  try {
    const assignments = await db.Assignment.findAll({
      where: { teacherId: req.teacher.id },
      include: [
        { model: db.Class, as: 'class' },
        { model: db.Subject, as: 'subject' },
      ],
      order: [['dueDate', 'DESC']],
    });

    res.json({ success: true, data: assignments.map(shape) });
  } catch (err) {
    next(err);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const teacher = req.teacher;
    const { classId, subjectId, title, description, dueDate } = req.body;

    const isAssigned = await verifyAssignment(teacher.id, classId, subjectId);
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You are not assigned to teach this subject for this class.' });
    }

    const assignment = await db.Assignment.create({
      teacherId: teacher.id,
      classId,
      subjectId,
      title,
      description,
      dueDate,
      attachmentPath: req.file ? `/uploads/assignments/${req.file.filename}` : null,
    });

    res.status(201).json({ success: true, message: 'Assignment created.', data: { id: assignment.id } });
  } catch (err) {
    next(err);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await db.Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }
    if (assignment.teacherId !== req.teacher.id) {
      return res.status(403).json({ success: false, message: 'You can only edit assignments you created yourself.' });
    }

    const { title, description, dueDate } = req.body;
    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (req.file) assignment.attachmentPath = `/uploads/assignments/${req.file.filename}`;

    await assignment.save();
    res.json({ success: true, message: 'Assignment updated.' });
  } catch (err) {
    next(err);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await db.Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }
    if (assignment.teacherId !== req.teacher.id) {
      return res.status(403).json({ success: false, message: 'You can only delete assignments you created yourself.' });
    }

    await assignment.destroy();
    res.json({ success: true, message: 'Assignment deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAssignments, createAssignment, updateAssignment, deleteAssignment };
