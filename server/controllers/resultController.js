const { Op } = require('sequelize');
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

const EXAM_TYPES = ['Assessment 1', 'Assessment 2', 'Monthly Test', 'Module Test', 'Mock Exam', 'Final Exam', 'Other'];

// --- GET /me/results ---------------------------------------------------------------
// Two modes behind one endpoint, distinguished by whether classId/subjectId/
// month are all supplied:
//  - all three given  -> the original Phase 6 "class roster" view (every
//    student in that class/subject/month, with or without a result yet).
//    Kept exactly as before -- nothing about this mode changed.
//  - none given (Phase 7.5) -> "every result I've personally submitted,
//    across every class/subject/month/exam type" -- the flat list the new
//    Teacher Results page's Submitted Results Table is built from.
// This keeps the existing API contract for the roster mode completely
// intact, and only gives meaning to the previously-invalid "no filters"
// case rather than replacing anything.
const getRoster = async (req, res, next) => {
  try {
    const teacher = req.teacher;
    const { classId, subjectId, month } = req.query;

    if (classId || subjectId || month) {
      if (!classId || !subjectId || !month) {
        return res.status(400).json({ success: false, message: 'classId, subjectId, and month are all required together.' });
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
        include: [{ model: db.User, as: 'reviewer' }],
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
          examType: r ? r.examType : null,
          marks: r ? r.marks : null,
          totalMarks: r ? r.totalMarks : null,
          grade: r ? r.grade : null,
          percentage: r ? r.percentage : null,
          teacherRemarks: r ? r.teacherRemarks : null,
          status: r ? r.status : null,
          rejectionReason: r ? r.rejectionReason : null,
          reviewedBy: r && r.reviewer ? r.reviewer.name : null,
          reviewedAt: r ? r.reviewedAt : null,
          editable: r ? r.status !== 'approved' && r.createdBy === req.user.id : true,
        };
      });

      return res.json({ success: true, data: roster });
    }

    // "My submitted results" mode -- Phase 7.5.
    const mine = await db.Result.findAll({
      where: { createdBy: req.user.id },
      include: [
        { model: db.Student, as: 'student', include: [{ model: db.User, as: 'user' }] },
        { model: db.Subject, as: 'subject' },
        { model: db.Class, as: 'class' },
        { model: db.User, as: 'reviewer' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: mine.map((r) => ({
        resultId: r.id,
        studentId: r.studentId,
        studentName: r.student.user.name,
        rollNumber: r.student.rollNumber,
        classId: r.classId,
        class: `${r.class.name}-${r.class.section}`,
        subjectId: r.subjectId,
        subject: r.subject.name,
        examType: r.examType,
        month: r.month,
        marks: r.marks,
        totalMarks: r.totalMarks,
        grade: r.grade,
        percentage: r.percentage,
        teacherRemarks: r.teacherRemarks,
        status: r.status,
        submittedDate: r.createdAt,
        lastUpdated: r.updatedAt,
        reviewedBy: r.reviewer ? r.reviewer.name : null,
        reviewedAt: r.reviewedAt,
        rejectionReason: r.rejectionReason,
        editable: r.status !== 'approved',
      })),
    });
  } catch (err) {
    next(err);
  }
};

// --- Create ---------------------------------------------------------------------
const createResult = async (req, res, next) => {
  try {
    const teacher = req.teacher;
    const { studentId, classId, subjectId, month, examType, marks, totalMarks, teacherRemarks } = req.body;

    const isAssigned = await verifyAssignment(teacher.id, classId, subjectId);
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You are not assigned to teach this subject for this class.' });
    }

    const student = await db.Student.findByPk(studentId);
    if (!student || student.classId !== parseInt(classId, 10)) {
      return res.status(400).json({ success: false, message: 'This student is not enrolled in the selected class.' });
    }

    if (examType && !EXAM_TYPES.includes(examType)) {
      return res.status(400).json({ success: false, message: 'Invalid exam type.' });
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
      examType: examType || 'Monthly Test',
      marks,
      totalMarks: totalMarks ?? 100,
      teacherRemarks,
      status: 'pending',
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Result submitted successfully. Waiting for Examination Board approval.',
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
        .json({ success: false, message: 'Approved results cannot be modified. Contact the Examination Board to change it.' });
    }

    const { marks, totalMarks, examType, teacherRemarks } = req.body;
    const nextMarks = marks ?? result.marks;
    const nextTotal = totalMarks ?? result.totalMarks;

    if (examType && !EXAM_TYPES.includes(examType)) {
      return res.status(400).json({ success: false, message: 'Invalid exam type.' });
    }

    const marksError = validateMarks(nextMarks, nextTotal);
    if (marksError) {
      return res.status(400).json({ success: false, message: marksError });
    }

    const wasRejected = result.status === 'rejected';

    result.marks = nextMarks;
    result.totalMarks = nextTotal;
    if (examType !== undefined) result.examType = examType;
    if (teacherRemarks !== undefined) result.teacherRemarks = teacherRemarks;
    // A rejected result being edited is a resubmission -- send it back to
    // pending so the Examination Board reviews it again (Phase 7). A
    // pending result simply stays pending; there's nothing to "re-trigger."
    if (wasRejected) {
      result.status = 'pending';
      result.rejectionReason = null;
    }
    await result.save();

    res.json({
      success: true,
      message: wasRejected ? 'Result resubmitted for Examination Board approval.' : 'Result updated.',
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
        .json({ success: false, message: 'Approved results cannot be modified. Contact the Examination Board to remove it.' });
    }

    await result.destroy();
    res.json({ success: true, message: 'Result deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoster, createResult, updateResult, deleteResult, EXAM_TYPES };
