const express = require('express');
const path = require('path');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../models');

// Shared access check: teachers/admins can download anything; a student can
// only download a file belonging to their own class. Used by both routes
// below so the rule lives in one place.
const canAccess = async (user, classId) => {
  if (user.role !== 'student') return true;
  const student = await db.Student.findOne({ where: { userId: user.id } });
  return !!student && student.classId === classId;
};

router.get('/assignments/:id/download', protect, async (req, res, next) => {
  try {
    const assignment = await db.Assignment.findByPk(req.params.id);
    if (!assignment || !assignment.attachmentPath) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }
    if (!(await canAccess(req.user, assignment.classId))) {
      return res.status(403).json({ success: false, message: 'You do not have access to this file.' });
    }
    const absolutePath = path.join(__dirname, '..', assignment.attachmentPath.replace(/^\//, ''));
    res.download(absolutePath, `${assignment.title}${path.extname(absolutePath)}`);
  } catch (err) {
    next(err);
  }
});

router.get('/lecture-materials/:id/download', protect, async (req, res, next) => {
  try {
    const material = await db.LectureUnit.findByPk(req.params.id);
    if (!material || !material.filePath) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }
    if (!(await canAccess(req.user, material.classId))) {
      return res.status(403).json({ success: false, message: 'You do not have access to this file.' });
    }
    const absolutePath = path.join(__dirname, '..', material.filePath.replace(/^\//, ''));
    res.download(absolutePath, `${material.title}${path.extname(absolutePath)}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
