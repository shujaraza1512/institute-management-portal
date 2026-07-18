const bcrypt = require('bcryptjs');
const db = require('../models');

// The Examination Board account has no separate profile table (unlike
// Student/Teacher) -- it's a plain User row. "Profile" here is just that
// row's own name/email, editable by the admin themselves.
const getProfile = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        instituteId: user.instituteId,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    const { name, email } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    await user.save();

    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await db.User.findByPk(req.user.id);
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
