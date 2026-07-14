const { Op } = require('sequelize');
const db = require('../models');

// --- List / search / filter ---------------------------------------------------------
const getResults = async (req, res, next) => {
  try {
    const { status, search, classId, subjectId, teacherId, month } = req.query;

    const where = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) where.status = status;
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.createdBy = teacherId;
    if (month) where.month = month;

    // Search matches student name, Institute ID, or roll number -- whichever
    // the admin typed, since the spec lists all three as valid search targets.
    const studentWhere = search
      ? {
          [Op.or]: [
            { '$student.user.name$': { [Op.like]: `%${search}%` } },
            { '$student.user.instituteId$': { [Op.like]: `%${search}%` } },
            { '$student.rollNumber$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const results = await db.Result.findAll({
      where: { ...where, ...studentWhere },
      include: [
        { model: db.Student, as: 'student', include: [{ model: db.User, as: 'user' }] },
        { model: db.Subject, as: 'subject' },
        { model: db.Class, as: 'class' },
        { model: db.User, as: 'creator' },
        { model: db.User, as: 'reviewer' },
      ],
      order: [['createdAt', 'DESC']],
      subQuery: false,
    });

    res.json({
      success: true,
      data: results.map((r) => ({
        id: r.id,
        studentName: r.student.user.name,
        rollNumber: r.student.rollNumber,
        instituteId: r.student.user.instituteId,
        class: `${r.class.name}-${r.class.section}`,
        subject: r.subject.name,
        marks: r.marks,
        totalMarks: r.totalMarks,
        percentage: r.percentage,
        grade: r.grade,
        teacher: r.creator ? r.creator.name : null,
        month: r.month,
        submittedAt: r.createdAt,
        status: r.status,
        reviewedBy: r.reviewer ? r.reviewer.name : null,
        reviewedAt: r.reviewedAt,
        rejectionReason: r.rejectionReason,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// --- Approve ---------------------------------------------------------------------
const approveResult = async (req, res, next) => {
  try {
    const result = await db.Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }
    if (result.status === 'approved') {
      return res.status(409).json({ success: false, message: 'This result is already approved.' });
    }

    result.status = 'approved';
    result.reviewedBy = req.user.id;
    result.reviewedAt = new Date();
    result.rejectionReason = null;
    await result.save();

    res.json({ success: true, message: 'Result approved. It is now visible to the student.' });
  } catch (err) {
    next(err);
  }
};

// --- Reject ---------------------------------------------------------------------
const rejectResult = async (req, res, next) => {
  try {
    const result = await db.Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }
    if (result.status === 'approved') {
      return res.status(409).json({ success: false, message: 'This result is already approved and cannot be rejected retroactively.' });
    }

    result.status = 'rejected';
    result.reviewedBy = req.user.id;
    result.reviewedAt = new Date();
    result.rejectionReason = req.body.reason || null;
    await result.save();

    res.json({ success: true, message: 'Result rejected. The teacher can review and resubmit it.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResults, approveResult, rejectResult };
