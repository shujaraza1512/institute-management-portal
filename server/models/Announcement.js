module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define(
    'Announcement',
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      // Lets an announcement target one portal instead of always
      // broadcasting to everyone, without needing a separate table.
      audience: {
        type: DataTypes.ENUM('all', 'students', 'teachers'),
        allowNull: false,
        defaultValue: 'all',
      },
      postedBy: { type: DataTypes.INTEGER }, // Users.id — nullable for system-generated notices
    },
    { tableName: 'announcements' }
  );

  Announcement.associate = (models) => {
    Announcement.belongsTo(models.User, { foreignKey: 'postedBy', as: 'author' });
  };

  return Announcement;
};
