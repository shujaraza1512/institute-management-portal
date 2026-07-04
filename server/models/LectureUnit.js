module.exports = (sequelize, DataTypes) => {
  // Notes, PPTs, and assignments a teacher uploads for students to download.
  // Unlike TeacherUpload (results/papers), these need no admin approval —
  // they're visible to students as soon as they're uploaded.
  const LectureUnit = sequelize.define(
    'LectureUnit',
    {
      teacherId: { type: DataTypes.INTEGER, allowNull: false },
      classId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      materialType: {
        type: DataTypes.ENUM('notes', 'ppt', 'assignment', 'other'),
        allowNull: false,
        defaultValue: 'notes',
      },
      filePath: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: 'lecture_units' }
  );

  LectureUnit.associate = (models) => {
    LectureUnit.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    LectureUnit.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    LectureUnit.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
  };

  return LectureUnit;
};
