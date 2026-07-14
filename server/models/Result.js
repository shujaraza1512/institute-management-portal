// Grade boundaries used by the beforeSave hook below. Centralized here (not
// duplicated per-controller) so grade is always consistent no matter which
// code path creates or edits a Result -- Phase 6's teacher CRUD today,
// Phase 7's admin edits later.
const calculateGrade = (marks, totalMarks) => {
  const pct = (parseFloat(marks) / parseFloat(totalMarks)) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
};

module.exports = (sequelize, DataTypes) => {
  // Phase 6 changed how rows land here: a teacher now creates a Result
  // directly (status: 'pending') instead of uploading a file for the
  // Examination Board to parse. The "teacher cannot publish directly"
  // rule from the original spec still holds -- it's enforced by student-
  // facing queries (Phase 5's studentController) only ever reading rows
  // where status = 'approved'. Phase 7 will let the Examination Board flip
  // pending rows to approved/rejected.
  const Result = sequelize.define(
    'Result',
    {
      studentId: { type: DataTypes.INTEGER, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: false },
      classId: { type: DataTypes.INTEGER, allowNull: false },
      marks: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      totalMarks: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100 },
      // Always recomputed server-side in the beforeSave hook below -- never
      // trusted from client input, so it can never disagree with marks/totalMarks.
      grade: { type: DataTypes.STRING },
      teacherRemarks: { type: DataTypes.TEXT },
      month: {
        type: DataTypes.STRING, // 'YYYY-MM'
        allowNull: false,
      },
      // Added in Phase 7.5's teacher submission form. A student can now
      // legitimately have more than one result for the same subject+month
      // (e.g. both an "Assessment 1" and a "Monthly Test" in April) -- see
      // the widened unique index below, which is the direct consequence.
      examType: {
        type: DataTypes.ENUM('Assessment 1', 'Assessment 2', 'Monthly Test', 'Module Test', 'Mock Exam', 'Final Exam', 'Other'),
        allowNull: false,
        defaultValue: 'Monthly Test', // keeps every pre-Phase-7.5 row (and any caller that omits it) valid
      },
      // Added in Phase 6. Lets student-facing queries show only published
      // results, and lets a teacher's own pending submissions be counted
      // and listed distinctly from what's already visible to students.
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      // Added in Phase 6. Who created/last-owns this row -- what makes
      // "a teacher cannot edit another teacher's result" enforceable.
      createdBy: { type: DataTypes.INTEGER },
      // Added in Phase 7 -- who on the Examination Board approved/rejected
      // this, when, and (for a rejection) why.
      reviewedBy: { type: DataTypes.INTEGER },
      reviewedAt: { type: DataTypes.DATE },
      rejectionReason: { type: DataTypes.TEXT },
      // Traces which approved TeacherUpload this row came from, if any
      // (legacy file-upload path from Phase 2 -- not used by Phase 6's
      // direct-entry flow, kept for any row created that way).
      sourceUploadId: { type: DataTypes.INTEGER },
      // Computed on read instead of stored, so it can never drift out of
      // sync with marks/totalMarks.
      percentage: {
        type: DataTypes.VIRTUAL,
        get() {
          const marks = parseFloat(this.getDataValue('marks'));
          const total = parseFloat(this.getDataValue('totalMarks'));
          if (!total) return null;
          return Math.round((marks / total) * 10000) / 100; // 2 decimal places
        },
      },
    },
    {
      tableName: 'results',
      indexes: [{ unique: true, fields: ['studentId', 'subjectId', 'month', 'examType'] }],
      hooks: {
        beforeSave: (result) => {
          if (result.marks != null && result.totalMarks != null) {
            result.grade = calculateGrade(result.marks, result.totalMarks);
          }
        },
      },
    }
  );

  Result.associate = (models) => {
    Result.belongsTo(models.Student, { foreignKey: 'studentId', as: 'student' });
    Result.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
    Result.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    Result.belongsTo(models.TeacherUpload, { foreignKey: 'sourceUploadId', as: 'sourceUpload' });
    Result.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Result.belongsTo(models.User, { foreignKey: 'reviewedBy', as: 'reviewer' });
  };

  Result.calculateGrade = calculateGrade;

  return Result;
};
