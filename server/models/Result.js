module.exports = (sequelize, DataTypes) => {
  // Only approved, student-visible results live here — there's no "pending"
  // status on this table by design. A pending submission lives in
  // TeacherUpload until the Examination Board approves it; only then does a
  // Result row get created, which is what makes "Final Result Publishing"
  // a meaningful, distinct action rather than just a status flip.
  const Result = sequelize.define(
    'Result',
    {
      studentId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
      classId: { type: DataTypes.INTEGER, allowNull: false },
      marks: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      totalMarks: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100 },
      grade: { type: DataTypes.STRING },
      teacherRemarks: { type: DataTypes.TEXT },
      month: {
        type: DataTypes.STRING, // 'YYYY-MM'
        allowNull: false,
      },
      // Traces which approved TeacherUpload this row came from. Nullable
      // because the admin can also key in a result directly.
      sourceUploadId: { type: DataTypes.INTEGER },
      // Computed on read instead of stored, so it can never drift out of
      // sync with marks/totalMarks.
      percentage: {
        type: DataTypes.VIRTUAL,
        get() {
          const marks = parseFloat(this.getDataValue('marks'));
          const total = parseFloat(this.getDataValue('totalMarks'));
          if (!total) return null;
          return Math.round((marks / total) * 10000) / 100; // 2 decimal places
        },
      },
    },
    {
      tableName: 'results',
      indexes: [{ unique: true, fields: ['studentId', 'subjectId', 'month'] }],
    }
  );

  Result.associate = (models) => {
    Result.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
    Result.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
    Result.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    Result.belongsTo(models.TeacherUpload, { foreignKey: 'sourceUploadId', as: 'sourceUpload' });
  };

  return Result;
};
