module.exports = (sequelize, DataTypes) => {
  // New in Phase 6. Distinct from LectureUnit (materials) -- an Assignment
  // has its own shape (description, due date, optional attachment) and its
  // own CRUD surface, per the Phase 6 spec treating them as separate
  // features rather than one of LectureUnit's material types.
  const Assignment = sequelize.define(
    'Assignment',
    {
      teacherId: { type: DataTypes.INTEGER, allowNull: false },
      classId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      dueDate: { type: DataTypes.DATEONLY, allowNull: false },
      // Nullable -- the spec explicitly allows a placeholder here if a real
      // attachment isn't provided, so an Assignment without a file is valid.
      attachmentPath: { type: DataTypes.STRING },
    },
    { tableName: 'assignments' }
  );

  Assignment.associate = (models) => {
    Assignment.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    Assignment.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    Assignment.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
  };

  return Assignment;
};
