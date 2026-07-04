function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="bg-white rounded-card shadow-card p-8 max-w-sm w-full text-center">
        <h1 className="text-xl font-display text-navy-800">Login</h1>
        <p className="mt-2 text-sm text-muted">
          The real form (role selector, ID/email, password, validation) is built
          in Phase 3 alongside authentication.
        </p>
      </div>
    </div>
  );
}

export default Login;
