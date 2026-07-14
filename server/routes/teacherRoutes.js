const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const loadTeacher = require('../middleware/loadTeacher');
const validate = require('../middleware/validate');
const { uploadAssignmentFile, uploadLectureMaterialFile } = require('../middleware/uploadFile');

const teacherCtrl = require('../controllers/teacherController');
const resultCtrl = require('../controllers/resultController');
const assignmentCtrl = require('../controllers/assignmentController');
const materialCtrl = require('../controllers/lectureMaterialController');

// Every route below requires a valid session (protect), the teacher role
// specifically (authorize), and resolves req.teacher to the caller's own
// record (loadTeacher) -- no route ever accepts a teacherId from the client.
router.use(protect, authorize('teacher'), loadTeacher);

router.get('/me/dashboard', teacherCtrl.getDashboard);
router.get('/me/profile', teacherCtrl.getProfile);
router.get('/me/classes', teacherCtrl.getAssignedClasses);
router.get('/me/students', teacherCtrl.getMyStudents); // Phase 7.5 -- data source for the result submission form
router.get('/me/timetable', teacherCtrl.getTimetable);
router.get('/me/announcements', teacherCtrl.getAnnouncements);

router.put(
  '/me/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  ],
  validate,
  teacherCtrl.changePassword
);

const EXAM_TYPES = ['Assessment 1', 'Assessment 2', 'Monthly Test', 'Module Test', 'Mock Exam', 'Final Exam', 'Other'];

// --- Results ---------------------------------------------------------------------
// With no query params: every result the teacher has personally submitted
// (Phase 7.5). With classId+subjectId+month: the original Phase 6 class
// roster view. See resultController.js's getRoster for the branch logic.
router.get('/me/results', resultCtrl.getRoster);

router.post(
  '/me/results',
  [
    body('studentId').isInt().withMessage('A valid student must be selected.'),
    body('classId').isInt().withMessage('A valid class must be selected.'),
    body('subjectId').isInt().withMessage('A valid subject must be selected.'),
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format.'),
    body('examType').optional().isIn(EXAM_TYPES).withMessage('Invalid exam type.'),
    body('marks').isFloat({ min: 0 }).withMessage('Marks must be a non-negative number.'),
  ],
  validate,
  resultCtrl.createResult
);

router.put(
  '/me/results/:id',
  [
    body('marks').optional().isFloat({ min: 0 }).withMessage('Marks must be a non-negative number.'),
    body('examType').optional().isIn(EXAM_TYPES).withMessage('Invalid exam type.'),
  ],
  validate,
  resultCtrl.updateResult
);

router.delete('/me/results/:id', resultCtrl.deleteResult);

// --- Assignments ---------------------------------------------------------------------
router.get('/me/assignments', assignmentCtrl.getAssignments);

router.post(
  '/me/assignments',
  uploadAssignmentFile.single('attachment'),
  [
    body('classId').isInt().withMessage('A valid class must be selected.'),
    body('subjectId').isInt().withMessage('A valid subject must be selected.'),
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('dueDate').isISO8601().withMessage('A valid due date is required.'),
  ],
  validate,
  assignmentCtrl.createAssignment
);

router.put('/me/assignments/:id', uploadAssignmentFile.single('attachment'), assignmentCtrl.updateAssignment);
router.delete('/me/assignments/:id', assignmentCtrl.deleteAssignment);

// --- Lecture materials ---------------------------------------------------------------------
router.get('/me/lecture-materials', materialCtrl.getLectureMaterials);

router.post(
  '/me/lecture-materials',
  uploadLectureMaterialFile.single('file'),
  [
    body('classId').isInt().withMessage('A valid class must be selected.'),
    body('subjectId').isInt().withMessage('A valid subject must be selected.'),
    body('title').trim().notEmpty().withMessage('Title is required.'),
  ],
  validate,
  materialCtrl.createLectureMaterial
);

router.put('/me/lecture-materials/:id', uploadLectureMaterialFile.single('file'), materialCtrl.updateLectureMaterial);
router.delete('/me/lecture-materials/:id', materialCtrl.deleteLectureMaterial);

module.exports = router;
