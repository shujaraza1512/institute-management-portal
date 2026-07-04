// Verifies the JWT on incoming requests and attaches the user to req.user.
// Full implementation (token verification, user lookup) lands in
// Phase 3: Authentication & RBAC. The stub below fails closed, so
// protected routes never accidentally let requests through unauthenticated
// while this is still being built.
const protect = (req, res, next) => {
  return res.status(501).json({
    success: false,
    message: 'Authentication is not implemented yet (Phase 3).',
  });
};

module.exports = { protect };
