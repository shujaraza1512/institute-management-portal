const db = require('../models');

// Lightweight lists for populating <select> dropdowns across the admin
// forms (Student/Teacher class assignment, Timetable/Paper Schedule
// class+subject+teacher pickers) -- not full CRUD resources, just data sources.
const getLookups = async (req, res, next) => {
  try {
    const [classes, subjects, teachers] = await Promise.all([
      db.Class.findAll({ order: [['name', 'ASC'], ['section', 'ASC']] }),
      db.Subject.findAll({ order: [['name', 'ASC']] }),
      db.Teacher.findAll({ include: [{ model: db.User, as: 'user' }], order: [['id', 'ASC']] }),
    ]);

    res.json({
      success: true,
      data: {
        classes: classes.map((c) => ({ id: c.id, name: `${c.name}-${c.section}` })),
        subjects: subjects.map((s) => ({ id: s.id, name: s.name })),
        teachers: teachers.map((t) => ({ id: t.id, name: t.user.name })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLookups };
