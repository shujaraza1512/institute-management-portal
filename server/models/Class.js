module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define(
    'Class',
    {
      // e.g. "9", "10" — the grade/year, not a section letter.
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // e.g. "A", "B" — combined with `name` this uniquely identifies one
      // roster (e.g. "10-A"), matching how a real school assigns students,
      // teachers, timetables, and exam schedules to one specific group.
      // Kept on Class rather than as a separate field on Student so a
      // class's section lives in exactly one place (proper normalization).
      section: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Added in Phase 7 for Class Management -- the homeroom/class teacher,
      // distinct from TeacherAssignment (which teachers teach which subject).
      classTeacherId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'classes',
      indexes: [{ unique: true, fields: ['name', 'section'] }],
    }
  );

  Class.associate = (models) => {
    Class.belongsTo(models.Teacher, { foreignKey: 'classTeacherId', as: 'classTeacher' });
    Class.hasMany(models.Student, { foreignKey: 'classId', as: 'students' });
    Class.hasMany(models.TeacherAssignment, { foreignKey: 'classId', as: 'teacherAssignments' });
    Class.hasMany(models.Timetable, { foreignKey: 'classId', as: 'timetableEntries' });
    Class.hasMany(models.PaperSchedule, { foreignKey: 'classId', as: 'paperSchedules' });
    Class.hasMany(models.LectureUnit, { foreignKey: 'classId', as: 'lectureUnits' });
    Class.hasMany(models.TeacherUpload, { foreignKey: 'classId', as: 'teacherUploads' });
    Class.hasMany(models.Result, { foreignKey: 'classId', as: 'results' });
    Class.hasMany(models.Attendance, { foreignKey: 'classId', as: 'attendanceRecords' });
    Class.hasMany(models.Assignment, { foreignKey: 'classId', as: 'assignments' });
  };

  return Class;
};
