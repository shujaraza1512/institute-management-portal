const express = require('express');
const router = express.Router();

// Health check — lets the client (and you) confirm the API is reachable.
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Institute Management Portal API is running.' });
});

// Route modules are mounted here as each phase is built:
router.use('/auth', require('./authRoutes')); // Phase 3
// router.use('/students', require('./studentRoutes'));  // Phase 5
// router.use('/teachers', require('./teacherRoutes'));  // Phase 6
// router.use('/admin', require('./adminRoutes'));       // Phase 7

module.exports = router;
