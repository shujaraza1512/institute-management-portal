import { useState } from 'react';
import { User as UserIcon, Pencil } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';

// New in Phase 8. The Examination Board account previously had no
// self-profile page at all -- every other role did (Student/Teacher since
// Phase 5/6). This fills that gap so "click your name -> Profile" works
// consistently across all three roles.
function Profile() {
  const { data, loading, error, refetch } = useFetch('/admin/profile');

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingState label="Loading profile…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const startEdit = () => {
    setForm({ name: data.name, email: data.email });
    setEditError('');
    setEditSuccess('');
    setEditing(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!form.name.trim() || !form.email.trim()) {
      setEditError('Name and email are required.');
      return;
    }

    setSavingProfile(true);
    try {
      await api.put('/admin/profile', form);
      setEditSuccess('Profile updated successfully.');
      setEditing(false);
      refetch();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

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
      await api.put('/admin/profile/password', { currentPassword, newPassword });
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-navy-800 truncate">{data.name}</p>
              <p className="text-sm text-muted">Institute ID: {data.instituteId}</p>
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="btn-secondary btn-sm flex-shrink-0">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>

        {editSuccess && !editing && <p className="field-success mt-4">{editSuccess}</p>}

        {editing ? (
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field-input" />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field-input" />
              </div>
            </div>

            {editError && <p className="field-error">{editError}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={savingProfile} className="btn-primary btn-sm">
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-link">Cancel</button>
            </div>
          </form>
        ) : (
          <dl className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="text-ink mt-0.5">{data.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="text-ink mt-0.5">Examination Board</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        <p className="font-display text-navy-800">Change Password</p>
        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
          <PasswordInput id="currentPassword" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
          <PasswordInput id="newPassword" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
          <PasswordInput id="confirmPassword" label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />

          {passwordError && <p className="field-error">{passwordError}</p>}
          {passwordSuccess && <p className="field-success">{passwordSuccess}</p>}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
