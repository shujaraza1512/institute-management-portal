import { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

function Profile() {
  const { data, loading, error, refetch } = useFetch('/teachers/me/profile');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingState label="Loading profile…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/teachers/me/password', { currentPassword, newPassword });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-display text-navy-800">Profile</h2>

      <div className="bg-white rounded-card shadow-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="font-display text-navy-800">{data.name}</p>
            <p className="text-sm text-muted">Employee ID: {data.instituteId}</p>
          </div>
        </div>

        <dl className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">Department</dt>
            <dd className="text-ink mt-0.5">{data.department || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="text-ink mt-0.5">{data.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Phone</dt>
            <dd className="text-ink mt-0.5">{data.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Assigned Classes</dt>
            <dd className="text-ink mt-0.5">{data.assignedClasses.length ? data.assignedClasses.join(', ') : '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted">Assigned Subjects</dt>
            <dd className="text-ink mt-0.5">{data.assignedSubjects.length ? data.assignedSubjects.join(', ') : '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        <p className="font-display text-navy-800">Change Password</p>
        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-ink mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          {passwordError && <p className="text-sm text-reject">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-approve">{passwordSuccess}</p>}

          <button type="submit" disabled={submitting}
            className="px-5 py-2.5 bg-navy-700 text-white rounded-card shadow-card hover:bg-navy-800 transition-colors disabled:opacity-60">
            {submitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
