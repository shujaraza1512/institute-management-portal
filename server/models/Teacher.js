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
    },
    { tableName: 'teachers' }
  );

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Teacher.hasMany(models.TeacherAssignment, { foreignKey: 'teacherId', as: 'assignments' });
    Teacher.hasMany(models.Timetable, { foreignKey: 'teacherId', as: 'timetableEntries' });
    Teacher.hasMany(models.LectureUnit, { foreignKey: 'teacherId', as: 'lectureUnits' });
    Teacher.hasMany(models.TeacherUpload, { foreignKey: 'teacherId', as: 'uploads' });
  };

  return Teacher;
};
