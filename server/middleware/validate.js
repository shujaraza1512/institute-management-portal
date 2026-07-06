const { validationResult } = require('express-validator');

// Drop this in after an array of express-validator checks (see authRoutes.js
// for an example). Short-circuits with the first validation error instead of
// letting a bad request reach the controller.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

module.exports = validate;
