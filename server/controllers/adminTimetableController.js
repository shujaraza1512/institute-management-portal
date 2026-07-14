const { Op } = require('sequelize');
const db = require('../models');

const shapeEntry = (e) => ({
  id: e.id,
  class: `${e.class.name}-${e.class.section}`,
  classId: e.classId,
  subject: e.subject.name,
  subjectId: e.subjectId,
  teacher: e.teacher.user.name,
  teacherId: e.teacherId,
  day: e.day,
  startTime: e.startTime,
  endTime: e.endTime,
  room: e.room,
});

const includes = [
  { model: db.Class, as: 'class' },
  { model: db.Subject, as: 'subject' },
  { model: db.Teacher, as: 'teacher', include: [{ model: db.User, as: 'user' }] },
];

const getTimetable = async (req, res, next) => {
  try {
    const { classId, teacherId } = req.query;
    const where = {};
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;

    const entries = await db.Timetable.findAll({ where, include: includes, order: [['day', 'ASC'], ['startTime', 'ASC']] });
    res.json({ success: true, data: entries.map(shapeEntry) });
  } catch (err) {
    next(err);
  }
};

const createEntry = async (req, res, next) => {
  try {
    const { classId, subjectId, teacherId, day, startTime, endTime, room } = req.body;

    // The model's unique indexes on (classId, day, startTime) and
    // (teacherId, day, startTime) already prevent double-booking at the DB
    // level -- this just turns that into a clear 409 instead of a raw
    // constraint-violation message (handled generically in errorHandler.js,
    // but a specific check here lets us say *which* conflict it is).
    const [classConflict, teacherConflict] = await Promise.all([
      db.Timetable.findOne({ where: { classId, day, startTime } }),
      db.Timetable.findOne({ where: { teacherId, day, startTime } }),
    ]);
    if (classConflict) {
      return res.status(409).json({ success: false, message: 'This class already has a lecture scheduled at that day and time.' });
    }
    if (teacherConflict) {
      return res.status(409).json({ success: false, message: 'This teacher already has a lecture scheduled at that day and time.' });
    }

    const entry = await db.Timetable.create({ classId, subjectId, teacherId, day, startTime, endTime, room });
    res.status(201).json({ success: true, message: 'Timetable entry created.', data: { id: entry.id } });
  } catch (err) {
    next(err);
  }
};

const updateEntry = async (req, res, next) => {
  try {
    const entry = await db.Timetable.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    }

    const { subjectId, teacherId, day, startTime, endTime, room } = req.body;
    const nextDay = day ?? entry.day;
    const nextStart = startTime ?? entry.startTime;
    const nextTeacherId = teacherId ?? entry.teacherId;

    const [classConflict, teacherConflict] = await Promise.all([
      db.Timetable.findOne({ where: { classId: entry.classId, day: nextDay, startTime: nextStart, id: { [Op.ne]: entry.id } } }),
      db.Timetable.findOne({ where: { teacherId: nextTeacherId, day: nextDay, startTime: nextStart, id: { [Op.ne]: entry.id } } }),
    ]);
    if (classConflict) {
      return res.status(409).json({ success: false, message: 'This class already has a lecture scheduled at that day and time.' });
    }
    if (teacherConflict) {
      return res.status(409).json({ success: false, message: 'This teacher already has a lecture scheduled at that day and time.' });
    }

    if (subjectId !== undefined) entry.subjectId = subjectId;
    if (teacherId !== undefined) entry.teacherId = teacherId;
    if (day !== undefined) entry.day = day;
    if (startTime !== undefined) entry.startTime = startTime;
    if (endTime !== undefined) entry.endTime = endTime;
    if (room !== undefined) entry.room = room;
    await entry.save();

    res.json({ success: true, message: 'Timetable entry updated.' });
  } catch (err) {
    next(err);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    const entry = await db.Timetable.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    }
    await entry.destroy();
    res.json({ success: true, message: 'Timetable entry deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTimetable, createEntry, updateEntry, deleteEntry };
