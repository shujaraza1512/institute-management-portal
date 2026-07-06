const db = require('../models');

// Runs after protect + authorize('student'). Resolves the Student profile
// linked to the logged-in user and attaches it as req.student, so every
// handler downstream works with "my own record" without ever trusting a
// studentId supplied by the client. This is what makes cross-student access
// structurally impossible here, rather than something checked for per-route.
const loadStudent = async (req, res, next) => {
  try {
    const student = await db.Student.findOne({
      where: { userId: req.user.id },
      include: [
        { model: db.Class, as: 'class' },
        { model: db.User, as: 'user' },
      ],
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'No student profile is linked to this account yet.' });
    }

    req.student = student;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = loadStudent;
