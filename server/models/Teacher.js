module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define(
    'Teacher',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // one Teacher profile per User
      },
      department: { type: DataTypes.STRING },
      phone: { type: DataTypes.STRING },
      // Added in Phase 7 for Teacher Management.
      qualification: { type: DataTypes.STRING },
    },
    { tableName: 'teachers' }
  );

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
    Teacher.hasMany(models.TeacherAssignment, { foreignKey: 'teacherId', as: 'assignments' });
    Teacher.hasMany(models.Timetable, { foreignKey: 'teacherId', as: 'timetableEntries' });
    Teacher.hasMany(models.LectureUnit, { foreignKey: 'teacherId', as: 'lectureUnits' });
    Teacher.hasMany(models.TeacherUpload, { foreignKey: 'teacherId', as: 'uploads' });
    Teacher.hasMany(models.Assignment, { foreignKey: 'teacherId', as: 'homeworkAssignments' });
    // Homeroom/class-teacher assignments, added in Phase 7's Class Management.
    Teacher.hasMany(models.Class, { foreignKey: 'classTeacherId', as: 'homeroomClasses' });
  };

  return Teacher;
};
