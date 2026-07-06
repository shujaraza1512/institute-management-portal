const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const loadStudent = require('../middleware/loadStudent');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/studentController');

// Every route below requires a valid session (protect), the student role
// specifically (authorize), and resolves req.student to the caller's own
// record (loadStudent) — nothing here ever accepts a studentId from the
// client, so there's no route that could even attempt to serve someone
// else's data.
router.use(protect, authorize('student'), loadStudent);

router.get('/me/dashboard', ctrl.getDashboard);
router.get('/me/profile', ctrl.getProfile);

router.put(
  '/me/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  ],
  validate,
  ctrl.changePassword
);

router.get('/me/results', ctrl.getResults);
router.get('/me/progress', ctrl.getProgress);
router.get('/me/timetable', ctrl.getTimetable);
router.get('/me/paper-schedule', ctrl.getPaperSchedule);
router.get('/me/announcements', ctrl.getAnnouncements);

module.exports = router;
