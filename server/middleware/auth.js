const { verifyToken } = require('../utils/jwt');
const db = require('../models');

// Reads the JWT from the httpOnly cookie set at login, verifies it, and
// loads the current user onto req.user so downstream handlers/authorize()
// can use it. Responds 401 rather than throwing, so callers don't need
// their own try/catch for "not logged in".
const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'You must be logged in to access this resource.' });
  }

  try {
    const decoded = verifyToken(token);
    const user = await db.User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Your session is no longer valid. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
  }
};

module.exports = { protect };
