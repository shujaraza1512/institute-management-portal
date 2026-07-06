module.exports = (sequelize, DataTypes) => {
  // Minimal attendance record so the Student Dashboard's "Overall Attendance
  // Percentage" reflects real data rather than being invented on the
  // frontend. A full Attendance Management workflow (teachers marking daily
  // attendance in bulk, editing past entries, etc.) is out of scope here —
  // see PHASE_NOTES.md — this just gives the read side something real to
  // compute from, and is intentionally the smallest table that does that.
  const Attendance = sequelize.define(
    'Attendance',
    {
      studentId: { type: DataTypes.INTEGER, allowNull: false },
      classId: { type: DataTypes.INTEGER, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.ENUM('present', 'absent', 'leave'),
        allowNull: false,
      },
    },
    {
      tableName: 'attendance',
      indexes: [{ unique: true, fields: ['studentId', 'date'] }],
    }
  );

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
    Attendance.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
  };

  return Attendance;
};
