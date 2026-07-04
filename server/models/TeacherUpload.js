module.exports = (sequelize, DataTypes) => {
  // A teacher-submitted file awaiting Examination Board review — either a
  // result sheet (type: 'result') or a monthly exam paper (type:
  // 'monthly_paper'). Both stay hidden from students until reviewed. Once a
  // 'result' upload is approved, its data is used to create the matching
  // Result rows — that logic belongs to the Phase 7 approvals controller,
  // not here; this table only tracks the raw submission and its review state.
  const TeacherUpload = sequelize.define(
    'TeacherUpload',
    {
      teacherId: { type: DataTypes.INTEGER, allowNull: false },
      classId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
      type: {
        type: DataTypes.ENUM('result', 'monthly_paper'),
        allowNull: false,
      },
      month: {
        type: DataTypes.STRING, // 'YYYY-MM'
        allowNull: false,
      },
      filePath: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'returned'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reviewedBy: { type: DataTypes.INTEGER }, // Users.id of the admin who reviewed it
      reviewNote: { type: DataTypes.TEXT },
      reviewedAt: { type: DataTypes.DATE },
    },
    { tableName: 'teacher_uploads' }
  );

  TeacherUpload.associate = (models) => {
    TeacherUpload.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    TeacherUpload.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    TeacherUpload.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
    TeacherUpload.belongsTo(models.User, { foreignKey: 'reviewedBy', as: 'reviewer' });
    TeacherUpload.hasMany(models.Result, { foreignKey: 'sourceUploadId', as: 'results' });
  };

  return TeacherUpload;
};
