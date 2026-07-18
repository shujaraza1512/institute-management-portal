import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../../components/common/Logo.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Examination Board' },
];

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in and revisiting /login directly? Send them straight
  // to their dashboard instead of showing the form again.
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login({ role, identifier: identifier.trim(), password });
      navigate(`/${loggedInUser.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't sign you in. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-10">
      {/* Soft brand-colored backdrop shapes -- adds depth without animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-navy-100/50 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-green-100/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card border border-navy-50 p-8 sm:p-10">
          <div className="text-center">
            <h1 className="text-xl font-display text-navy-800">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted">Sign in to your account to continue</p>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="field-label">I am signing in as a</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    aria-pressed={role === r.value}
                    className={`py-2.5 text-xs sm:text-sm rounded-card border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-1 ${
                      role === r.value
                        ? 'bg-navy-700 text-white border-navy-700'
                        : 'bg-white text-ink border-navy-100 hover:border-navy-300 hover:bg-navy-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="identifier" className="field-label">
                Institute ID or Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="field-input"
                placeholder="e.g. STU-2001 or you@institute.edu"
                autoComplete="username"
              />
            </div>

            <PasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <p role="alert" className="field-error bg-reject/5 border border-reject/20 rounded-card px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing in…' : 'Login'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Having trouble signing in? Contact your Examination Board administrator.
        </p>
      </div>
    </div>
  );
}

export default Login;
