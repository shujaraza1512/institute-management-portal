const { Op } = require('sequelize');
const db = require('../models');

const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      pendingResultApprovals,
      approvedResults,
      pendingAssignments,
      activeAnnouncements,
      recentResults,
      recentAssignments,
      recentAnnouncements,
    ] = await Promise.all([
      db.Student.count(),
      db.Teacher.count(),
      db.Class.count(),
      db.Subject.count(),
      db.Result.count({ where: { status: 'pending' } }),
      db.Result.count({ where: { status: 'approved' } }),
      // "Pending" here means not yet due -- Assignments have no approval
      // workflow (Phase 6 didn't add one), so this reads as "still upcoming."
      db.Assignment.count({ where: { dueDate: { [Op.gte]: today } } }),
      db.Announcement.count({
        where: { publishAt: { [Op.lte]: now }, [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gte]: now } }] },
      }),
      db.Result.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          { model: db.Student, as: 'student', include: [{ model: db.User, as: 'user' }] },
          { model: db.Subject, as: 'subject' },
        ],
      }),
      db.Assignment.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          { model: db.Class, as: 'class' },
          { model: db.Subject, as: 'subject' },
        ],
      }),
      db.Announcement.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        pendingResultApprovals,
        approvedResults,
        pendingAssignments,
        activeAnnouncements,
        recentActivity: {
          results: recentResults.map((r) => ({
            id: r.id,
            student: r.student.user.name,
            subject: r.subject.name,
            month: r.month,
            status: r.status,
            date: r.createdAt,
          })),
          assignments: recentAssignments.map((a) => ({
            id: a.id,
            title: a.title,
            class: `${a.class.name}-${a.class.section}`,
            subject: a.subject.name,
            date: a.createdAt,
          })),
          announcements: recentAnnouncements.map((a) => ({
            id: a.id,
            title: a.title,
            audience: a.audience,
            date: a.createdAt,
          })),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
