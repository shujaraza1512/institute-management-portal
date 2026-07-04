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

// Serves uploaded lecture notes / result sheets / papers back to the client.
app.use('/uploads', express.static('uploads'));

// --- API routes ---
app.use('/api', routes);

// --- Error handling (must stay last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
