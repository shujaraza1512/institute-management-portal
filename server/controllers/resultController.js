const db = require('../models');

// Shared guard for every write operation below: a teacher may only create/
// edit/delete results for a class+subject they're actually assigned to.
// This is checked in code (not just implied by the UI), since the API is
// the actual security boundary.
const verifyAssignment = async (teacherId, classId, subjectId) => {
  const assignment = await db.TeacherAssignment.findOne({ where: { teacherId, classId, subjectId } });
  return !!assignment;
};

const validateMarks = (marks, totalMarks) => {
  const m = parseFloat(marks);
  const t = parseFloat(totalMarks);
  if (Number.isNaN(m) || Number.isNaN(t)) return 'Marks and total marks must be numbers.';
  if (m < 0) return 'Marks cannot be negative.';
  if (t <= 0) return 'Total marks must be greater than zero.';
  if (m > t) return 'Marks cannot exceed total marks.';
  return null;
};

// --- Roster: every student in a class, with their result for one subject+month (or none yet) ---
const getRoster = async (req, res, next) => {
  try {
    const teacher = req.teacher;
    const { classId, subjectId, month } = req.query;

    if (!classId || !subjectId || !month) {
      return res.status(400).json({ success: false, message: 'classId, subjectId, and month are all required.' });
    }

    const isAssigned = await verifyAssignment(teacher.id, classId, subjectId);
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You are not assigned to teach this subject for this class.' });
    }

    const students = await db.Student.findAll({
      where: { classId },
      include: [{ model: db.User, as: 'user' }],
      order: [['rollNumber', 'ASC']],
    });

    const results = await db.Result.findAll({
      where: { classId, subjectId, month },
    });
    const resultByStudentId = {};
    results.forEach((r) => {
      resultByStudentId[r.studentId] = r;
    });

    const roster = students.map((s) => {
      const r = resultByStudentId[s.id];
      return {
        studentId: s.id,
        rollNumber: s.rollNumber,
        name: s.user.name,
        resultId: r ? r.id : null,
        marks: r ? r.marks : null,
        totalMarks: r ? r.totalMarks : null,
        grade: r ? r.grade : null,
        percentage: r ? r.percentage : null,
        teacherRemarks: r ? r.teacherRemarks : null,
        status: r ? r.status : null,
        editable: r ? r.status !== 'approved' && r.createdBy === req.user.id : true,
      };
    });

    res.json({ success: true, data: roster });
  } catch (err) {
    next(err);
  }
};

// --- Create ---------------------------------------------------------------------
const createResult = async (req, res, next) => {
  try {
    const teacher = req.teacher;
    const { studentId, classId, subjectId, month, marks, totalMarks, teacherRemarks } = req.body;

    const isAssigned = await verifyAssignment(teacher.id, classId, subjectId);
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You are not assigned to teach this subject for this class.' });
    }

    const student = await db.Student.findByPk(studentId);
    if (!student || student.classId !== parseInt(classId, 10)) {
      return res.status(400).json({ success: false, message: 'This student is not enrolled in the selected class.' });
    }

    const marksError = validateMarks(marks, totalMarks ?? 100);
    if (marksError) {
      return res.status(400).json({ success: false, message: marksError });
    }

    const result = await db.Result.create({
      studentId,
      classId,
      subjectId,
      month,
      marks,
      totalMarks: totalMarks ?? 100,
      teacherRemarks,
      status: 'pending',
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Result saved. It stays pending until the Examination Board approves it.',
      data: { id: result.id, grade: result.grade, percentage: result.percentage, status: result.status },
    });
  } catch (err) {
    next(err);
  }
};

// --- Update ---------------------------------------------------------------------
const updateResult = async (req, res, next) => {
  try {
    const result = await db.Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }

    // A teacher can only touch their own rows -- not another teacher's,
    // even for a class/subject they're both assigned to.
    if (result.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit results you created yourself.' });
    }

    if (result.status === 'approved') {
      return res
        .status(409)
        .json({ success: false, message: 'This result has already been approved and published. Contact the Examination Board to change it.' });
    }

    const { marks, totalMarks, teacherRemarks } = req.body;
    const nextMarks = marks ?? result.marks;
    const nextTotal = totalMarks ?? result.totalMarks;

    const marksError = validateMarks(nextMarks, nextTotal);
    if (marksError) {
      return res.status(400).json({ success: false, message: marksError });
    }

    result.marks = nextMarks;
    result.totalMarks = nextTotal;
    if (teacherRemarks !== undefined) result.teacherRemarks = teacherRemarks;
    // status stays 'pending' -- an edit doesn't re-trigger approval on its own,
    // it just means the pending submission changed before review.
    await result.save();

    res.json({
      success: true,
      message: 'Result updated.',
      data: { id: result.id, grade: result.grade, percentage: result.percentage, status: result.status },
    });
  } catch (err) {
    next(err);
  }
};

// --- Delete ---------------------------------------------------------------------
const deleteResult = async (req, res, next) => {
  try {
    const result = await db.Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }

    if (result.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete results you created yourself.' });
    }

    if (result.status === 'approved') {
      return res
        .status(409)
        .json({ success: false, message: 'This result has already been approved and published. Contact the Examination Board to remove it.' });
    }

    await result.destroy();
    res.json({ success: true, message: 'Result deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoster, createResult, updateResult, deleteResult };
