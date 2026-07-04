require('dotenv').config();

// Central place for non-secret app settings pulled from environment variables.
// Import this instead of reading process.env directly elsewhere.
module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_in_env',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};
