module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define(
    'Subject',
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      code: { type: DataTypes.STRING, unique: true },
    },
    { tableName: 'subjects' }
  );

  Subject.associate = (models) => {
    Subject.hasMany(models.TeacherAssignment, { foreignKey: 'subjectId', as: 'teacherAssignments' });
    Subject.hasMany(models.Timetable, { foreignKey: 'subjectId', as: 'timetableEntries' });
    Subject.hasMany(models.PaperSchedule, { foreignKey: 'subjectId', as: 'paperSchedules' });
    Subject.hasMany(models.LectureUnit, { foreignKey: 'subjectId', as: 'lectureUnits' });
    Subject.hasMany(models.TeacherUpload, { foreignKey: 'subjectId', as: 'teacherUploads' });
    Subject.hasMany(models.Result, { foreignKey: 'subjectId', as: 'results' });
    Subject.hasMany(models.Assignment, { foreignKey: 'subjectId', as: 'assignments' });
  };

  return Subject;
};
