const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../models');
const config = require('../config/config');
const { signToken, expiresInToMs } = require('../utils/jwt');

const COOKIE_NAME = 'token';

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, // not readable from JS — the main defense against XSS token theft
    secure: config.nodeEnv === 'production', // HTTPS-only outside local dev
    sameSite: 'lax',
    maxAge: expiresInToMs(config.jwt.expiresIn),
  });
};

// Never send the password hash to the client, even accidentally.
const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  instituteId: user.instituteId,
  role: user.role,
});

const login = async (req, res, next) => {
  try {
    const { role, identifier, password } = req.body;

    const user = await db.User.findOne({
      where: { [Op.or]: [{ email: identifier }, { instituteId: identifier }] },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Catches e.g. a student selecting "Examination Board" with otherwise
    // valid credentials — the role selector on the login page has to match
    // the account's actual role, not just any account that exists.
    if (user.role !== role) {
      const roleLabel = role === 'admin' ? 'an Examination Board' : `a ${role}`;
      return res.status(401).json({ success: false, message: `This account is not registered as ${roleLabel} account.` });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Contact the Examination Board.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true, message: 'Logged out.' });
};

// Lets the frontend ask "am I still logged in?" on page load/refresh —
// req.user is already populated by the protect middleware by the time this runs.
const me = (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
};

module.exports = { login, logout, me };
