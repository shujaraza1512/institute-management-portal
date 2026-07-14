const db = require('../models');

const shapeEntry = (e) => ({
  id: e.id,
  examName: e.examName,
  class: `${e.class.name}-${e.class.section}`,
  classId: e.classId,
  subject: e.subject.name,
  subjectId: e.subjectId,
  examDate: e.examDate,
  startTime: e.startTime,
  durationMinutes: e.durationMinutes,
  room: e.room,
});

const includes = [
  { model: db.Class, as: 'class' },
  { model: db.Subject, as: 'subject' },
];

const getPaperSchedules = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const where = {};
    if (classId) where.classId = classId;

    const entries = await db.PaperSchedule.findAll({ where, include: includes, order: [['examDate', 'ASC']] });
    res.json({ success: true, data: entries.map(shapeEntry) });
  } catch (err) {
    next(err);
  }
};

const createPaperSchedule = async (req, res, next) => {
  try {
    const { examName, classId, subjectId, examDate, startTime, durationMinutes, room } = req.body;
    const entry = await db.PaperSchedule.create({ examName, classId, subjectId, examDate, startTime, durationMinutes, room });
    res.status(201).json({ success: true, message: 'Paper schedule created.', data: { id: entry.id } });
  } catch (err) {
    next(err);
  }
};

const updatePaperSchedule = async (req, res, next) => {
  try {
    const entry = await db.PaperSchedule.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Paper schedule entry not found.' });
    }

    const { examName, subjectId, examDate, startTime, durationMinutes, room } = req.body;
    if (examName !== undefined) entry.examName = examName;
    if (subjectId !== undefined) entry.subjectId = subjectId;
    if (examDate !== undefined) entry.examDate = examDate;
    if (startTime !== undefined) entry.startTime = startTime;
    if (durationMinutes !== undefined) entry.durationMinutes = durationMinutes;
    if (room !== undefined) entry.room = room;
    await entry.save();

    res.json({ success: true, message: 'Paper schedule updated.' });
  } catch (err) {
    next(err);
  }
};

const deletePaperSchedule = async (req, res, next) => {
  try {
    const entry = await db.PaperSchedule.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Paper schedule entry not found.' });
    }
    await entry.destroy();
    res.json({ success: true, message: 'Paper schedule entry deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPaperSchedules, createPaperSchedule, updatePaperSchedule, deletePaperSchedule };
