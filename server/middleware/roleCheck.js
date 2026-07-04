// Restricts a route to specific roles, e.g. router.get('/', protect, authorize('admin'), handler).
// Full implementation lands in Phase 3: Authentication & RBAC, alongside auth.js.
const authorize = (...allowedRoles) => (req, res, next) => {
  return res.status(501).json({
    success: false,
    message: 'Role-based authorization is not implemented yet (Phase 3).',
  });
};

module.exports = { authorize };
