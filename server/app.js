const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const config = require('./config/config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// --- Core middleware ---
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Uploaded files (assignment attachments, lecture materials) are served
// through an authenticated, class-scoped route (see routes/downloadRoutes.js)
// rather than express.static -- a plain static mount would let anyone who
// guesses/finds a URL download a file with no login or class check at all,
// which doesn't hold up once real uploads exist (added in Phase 6).

// --- API routes ---
app.use('/api', routes);

// --- Error handling (must stay last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
