const jwt = require('jsonwebtoken');
const config = require('../config/config');

const signToken = (payload) => jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

// Converts a duration string like "1d" / "12h" / "30m" into milliseconds,
// so the same JWT_EXPIRES_IN value can also set the auth cookie's maxAge
// without duplicating the setting anywhere.
const expiresInToMs = (expiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 24 * 60 * 60 * 1000; // fallback: 1 day
  const value = Number(match[1]);
  const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * unitMs[match[2]];
};

module.exports = { signToken, verifyToken, expiresInToMs };
