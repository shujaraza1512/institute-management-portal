const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

const dashboardCtrl = require('../controllers/adminDashboardController');
const resultCtrl = require('../controllers/adminResultController');
const studentCtrl = require('../controllers/adminStudentController');
const teacherCtrl = require('../controllers/adminTeacherController');
const classCtrl = require('../controllers/adminClassController');
const subjectCtrl = require('../controllers/adminSubjectController');
const announcementCtrl = require('../controllers/adminAnnouncementController');
const timetableCtrl = require('../controllers/adminTimetableController');
const paperScheduleCtrl = require('../controllers/adminPaperScheduleController');
const lookupCtrl = require('../controllers/adminLookupController');
const profileCtrl = require('../controllers/adminProfileController');

// Every route below requires a valid session (protect) and the admin role
// specifically (authorize) -- no loadX middleware is needed here the way
// Phases 5/6 needed loadStudent/loadTeacher, since the Examination Board
// isn't scoped to "its own" records -- it has full institute-wide access
// by design (per the spec: "Full access. Can manage everything.").
router.use(protect, authorize('admin'));

router.get('/dashboard', dashboardCtrl.getDashboard);
router.get('/lookups', lookupCtrl.getLookups);

// --- Profile (Phase 8) ---------------------------------------------------------
router.get('/profile', profileCtrl.getProfile);
router.put('/profile', profileCtrl.updateProfile);
router.put(
  '/profile/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  ],
  validate,
  profileCtrl.changePassword
);

// --- Result approval ---------------------------------------------------------------------
router.get('/results', resultCtrl.getResults);
router.put('/results/:id/approve', resultCtrl.approveResult);
router.put('/results/:id/reject', resultCtrl.rejectResult);

// --- Student management ---------------------------------------------------------------------
router.get('/students', studentCtrl.getStudents);
router.get('/students/:id/report', studentCtrl.getStudentReport);
router.post(
  '/students',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('A valid email is required.'),
    body('instituteId').trim().notEmpty().withMessage('Institute ID is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  validate,
  studentCtrl.createStudent
);
router.put('/students/:id', studentCtrl.updateStudent);
router.put('/students/:id/status', [body('isActive').isBoolean().withMessage('isActive must be true or false.')], validate, studentCtrl.setStudentStatus);
router.delete('/students/:id', studentCtrl.deleteStudent);

// --- Teacher management ---------------------------------------------------------------------
router.get('/teachers', teacherCtrl.getTeachers);
router.post(
  '/teachers',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('A valid email is required.'),
    body('instituteId').trim().notEmpty().withMessage('Institute ID is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  validate,
  teacherCtrl.createTeacher
);
router.put('/teachers/:id', teacherCtrl.updateTeacher);
router.get('/teachers/:id/assignments', teacherCtrl.getAssignments);
router.put('/teachers/:id/assignments', teacherCtrl.setAssignments);
router.put('/teachers/:id/status', [body('isActive').isBoolean().withMessage('isActive must be true or false.')], validate, teacherCtrl.setTeacherStatus);
router.delete('/teachers/:id', teacherCtrl.deleteTeacher);

// --- Class management ---------------------------------------------------------------------
router.get('/classes', classCtrl.getClasses);
router.post(
  '/classes',
  [body('name').trim().notEmpty().withMessage('Class name is required.'), body('section').trim().notEmpty().withMessage('Section is required.')],
  validate,
  classCtrl.createClass
);
router.put('/classes/:id', classCtrl.updateClass);
router.delete('/classes/:id', classCtrl.deleteClass);

// --- Subject management ---------------------------------------------------------------------
router.get('/subjects', subjectCtrl.getSubjects);
router.post('/subjects', [body('name').trim().notEmpty().withMessage('Subject name is required.')], validate, subjectCtrl.createSubject);
router.put('/subjects/:id', subjectCtrl.updateSubject);
router.delete('/subjects/:id', subjectCtrl.deleteSubject);

// --- Announcement management ---------------------------------------------------------------------
router.get('/announcements', announcementCtrl.getAnnouncements);
router.post(
  '/announcements',
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('audience').optional().isIn(['all', 'students', 'teachers']).withMessage('Invalid audience.'),
  ],
  validate,
  announcementCtrl.createAnnouncement
);
router.put('/announcements/:id', announcementCtrl.updateAnnouncement);
router.delete('/announcements/:id', announcementCtrl.deleteAnnouncement);

// --- Timetable management ---------------------------------------------------------------------
router.get('/timetable', timetableCtrl.getTimetable);
router.post(
  '/timetable',
  [
    body('classId').isInt().withMessage('A valid class is required.'),
    body('subjectId').isInt().withMessage('A valid subject is required.'),
    body('teacherId').isInt().withMessage('A valid teacher is required.'),
    body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).withMessage('Invalid day.'),
  ],
  validate,
  timetableCtrl.createEntry
);
router.put('/timetable/:id', timetableCtrl.updateEntry);
router.delete('/timetable/:id', timetableCtrl.deleteEntry);

// --- Paper schedule management ---------------------------------------------------------------------
router.get('/paper-schedules', paperScheduleCtrl.getPaperSchedules);
router.post(
  '/paper-schedules',
  [
    body('classId').isInt().withMessage('A valid class is required.'),
    body('subjectId').isInt().withMessage('A valid subject is required.'),
    body('examDate').isISO8601().withMessage('A valid exam date is required.'),
  ],
  validate,
  paperScheduleCtrl.createPaperSchedule
);
router.put('/paper-schedules/:id', paperScheduleCtrl.updatePaperSchedule);
router.delete('/paper-schedules/:id', paperScheduleCtrl.deletePaperSchedule);

module.exports = router;
