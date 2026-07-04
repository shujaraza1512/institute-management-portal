module.exports = (sequelize, DataTypes) => {
  // Join table for the many-to-many relationship between Teachers, Classes,
  // and Subjects — one row means "this teacher teaches this subject to this
  // class". Backs both "Assign Subjects/Classes" under Teacher Management
  // and "Assign Teachers" under Class Management, since those two admin
  // screens describe the same underlying fact from opposite directions.
  const TeacherAssignment = sequelize.define(
    'TeacherAssignment',
    {
      teacherId: { type: DataTypes.INTEGER, allowNull: false },
      classId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: 'teacher_assignments',
      indexes: [{ unique: true, fields: ['teacherId', 'classId', 'subjectId'] }],
    }
  );

  TeacherAssignment.associate = (models) => {
    TeacherAssignment.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    TeacherAssignment.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    TeacherAssignment.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
  };

  return TeacherAssignment;
};
