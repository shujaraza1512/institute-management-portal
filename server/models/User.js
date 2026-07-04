module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      // Secondary login identifier the admin assigns on account creation
      // (roll number for students, employee code for teachers), so the
      // login page's "Institute ID or Email" field has something concrete
      // to check against besides email.
      instituteId: {
        type: DataTypes.STRING,
        unique: true,
      },
      // Stores a bcrypt hash, never the plain password. Hashing happens in
      // the account-creation/auth logic built in Phase 3, not here.
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('student', 'teacher', 'admin'),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    { tableName: 'users' }
  );

  User.associate = (models) => {
    User.hasOne(models.Student, { foreignKey: 'userId', as: 'studentProfile', onDelete: 'CASCADE' });
    User.hasOne(models.Teacher, { foreignKey: 'userId', as: 'teacherProfile', onDelete: 'CASCADE' });
    User.hasMany(models.Announcement, { foreignKey: 'postedBy', as: 'announcements' });
    User.hasMany(models.TeacherUpload, { foreignKey: 'reviewedBy', as: 'reviewedUploads' });
  };

  return User;
};
