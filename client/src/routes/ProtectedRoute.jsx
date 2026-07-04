// Route guard. Real logic (read the logged-in user from AuthContext, redirect
// to /login if there isn't one, redirect to the user's own dashboard if their
// role isn't in allowedRoles) is wired up in Phase 3: Authentication & RBAC.
// For now it renders its children directly so the app stays navigable
// while the rest of the scaffold is being built.
function ProtectedRoute({ children, allowedRoles }) {
  return children;
}

export default ProtectedRoute;
