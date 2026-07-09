const multer = require('multer');

// Centralized error handler. Any route or middleware that calls next(err)
// ends up here, so error responses stay consistent across the whole API.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server.';

  // Multer surfaces file-size/type problems as errors passed to next(err) --
  // give a clear 400 instead of letting them fall through as a generic 500.
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum size is 10MB.';
    }
  }

  // A duplicate insert (e.g. a second Result for the same student/subject/
  // month) throws this rather than a plain error -- worth a clear 409
  // instead of a raw 500 with a SQL-flavored message.
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'A record with these details already exists.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Catches requests to routes that don't exist.
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
