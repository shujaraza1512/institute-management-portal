module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    'Student',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // one Student profile per User
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: true, // may be unassigned right after the admin creates the account
      },
      rollNumber: { type: DataTypes.STRING },
      phone: { type: DataTypes.STRING },
      address: { type: DataTypes.STRING },
      photoUrl: { type: DataTypes.STRING },
    },
    {
      tableName: 'students',
      indexes: [{ unique: true, fields: ['classId', 'rollNumber'] }],
    }
  );

  Student.associate = (models) => {
    Student.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Student.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    Student.hasMany(models.Result, { foreignKey: 'studentId', as: 'results' });
  };

  return Student;
};
