module.exports = (sequelize, DataTypes) => {
  const Timetable = sequelize.define(
    'Timetable',
    {
      classId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
      teacherId: { type: DataTypes.INTEGER, allowNull: false },
      day: {
        type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        allowNull: false,
      },
      startTime: { type: DataTypes.TIME, allowNull: false },
      endTime: { type: DataTypes.TIME, allowNull: false },
      room: { type: DataTypes.STRING },
    },
    {
      tableName: 'timetables',
      indexes: [
        // A class can't have two lessons starting at the same time...
        { unique: true, fields: ['classId', 'day', 'startTime'] },
        // ...and neither can a teacher, even across two different classes.
        { unique: true, fields: ['teacherId', 'day', 'startTime'] },
      ],
    }
  );

  Timetable.associate = (models) => {
    Timetable.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    Timetable.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
    Timetable.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'teacher' });
  };

  return Timetable;
};
