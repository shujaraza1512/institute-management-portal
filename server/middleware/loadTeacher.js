const db = require('../models');

// Runs after protect + authorize('teacher'). Resolves the Teacher profile
// linked to the logged-in user and attaches it as req.teacher, mirroring
// loadStudent.js from Phase 5. No route under teacherRoutes.js accepts a
// teacherId from the client -- every handler works with "my own record."
const loadTeacher = async (req, res, next) => {
  try {
    const teacher = await db.Teacher.findOne({
      where: { userId: req.user.id },
      include: [{ model: db.User, as: 'user' }],
    });

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'No teacher profile is linked to this account yet.' });
    }

    req.teacher = teacher;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = loadTeacher;
