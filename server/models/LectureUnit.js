module.exports = (sequelize, DataTypes) => {
  // Notes/slides/PDFs/links a teacher shares with a class. No approval
  // workflow -- visible to that class as soon as it's created. Expanded in
  // Phase 6: description and externalLink are new; filePath is now nullable
  // since a material can be a link instead of an uploaded file. The
  // 'assignment' materialType from Phase 2 was removed here, since
  // Assignments are now their own model with their own fields (due date,
  // description) -- see server/models/Assignment.js.
  const LectureUnit = sequelize.define(
    'LectureUnit',
    {
      teacherId: { type: DataTypes.INTEGER, allowNull: false },
      classId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      materialType: {
        type: DataTypes.ENUM('pdf', 'notes', 'slides', 'link'),
        allowNull: false,
        defaultValue: 'notes',
      },
      // Exactly one of filePath / externalLink is expected to be set --
      // enforced in the controller (server/controllers/lectureMaterialController.js),
      // not at the DB level, since Sequelize/MySQL don't do "at least one of" constraints cleanly.
      filePath: { type: DataTypes.STRING },
      externalLink: { type: DataTypes.STRING },
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
