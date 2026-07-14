module.exports = (sequelize, DataTypes) => {
  // Exam schedule metadata only (date/time/room) — this is what students see
  // on the Paper Schedule page. The actual question paper file is handled
  // separately by TeacherUpload (type: 'monthly_paper'), which stays hidden
  // from students, so the two concerns don't get tangled into one table.
  const PaperSchedule = sequelize.define(
    'PaperSchedule',
    {
      classId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
      // Added in Phase 7 -- distinguishes e.g. "Mid-Term Exam" from "Monthly Test".
      examName: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Monthly Test' },
      examDate: { type: DataTypes.DATEONLY, allowNull: false },
      startTime: { type: DataTypes.TIME, allowNull: false },
      durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
      room: { type: DataTypes.STRING },
    },
    {
      tableName: 'paper_schedules',
      indexes: [{ unique: true, fields: ['classId', 'subjectId', 'examDate'] }],
    }
  );

  PaperSchedule.associate = (models) => {
    PaperSchedule.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    PaperSchedule.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
  };

  return PaperSchedule;
};
