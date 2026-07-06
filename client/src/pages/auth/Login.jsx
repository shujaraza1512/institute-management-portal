import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

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
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-8 max-w-sm w-full">
        <h1 className="text-xl font-display text-navy-800 text-center">Institute Management Portal</h1>
        <p className="mt-1 text-sm text-muted text-center">Sign in to your account</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-ink mb-1">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`py-2 text-xs sm:text-sm rounded-card border transition-colors ${
                    role === r.value
                      ? 'bg-navy-700 text-white border-navy-700'
                      : 'bg-white text-ink border-navy-100 hover:border-navy-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="identifier" className="block text-sm text-ink mb-1">
              Institute ID or Email
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. STU-2001 or you@institute.edu"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-ink mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-reject">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-navy-700 text-white rounded-card shadow-card hover:bg-navy-800 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
