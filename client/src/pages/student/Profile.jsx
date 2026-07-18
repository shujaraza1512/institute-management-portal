import { useState } from 'react';
import { User as UserIcon, Pencil } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';

function Profile() {
  const { data, loading, error, refetch } = useFetch('/students/me/profile');

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
    setForm({ phone: data.phone || '', address: data.address || '', guardianName: data.guardianName || '', guardianPhone: data.guardianPhone || '' });
    setEditError('');
    setEditSuccess('');
    setEditing(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setSavingProfile(true);
    try {
      await api.put('/students/me/profile', form);
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
      await api.put('/students/me/password', { currentPassword, newPassword });
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
            <p className="text-xs text-muted -mt-2">
              Name, email, class, and roll number are managed by the Examination Board. You can update your own contact details below.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Class</label>
                <input type="text" readOnly value={data.class ? `${data.class.name}-${data.class.section}` : 'Not yet assigned'} className="field-input" />
              </div>
              <div>
                <label className="field-label">Roll Number</label>
                <input type="text" readOnly value={data.rollNumber || '—'} className="field-input" />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field-input" />
              </div>
              <div>
                <label className="field-label">Guardian Name</label>
                <input type="text" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} className="field-input" />
              </div>
              <div>
                <label className="field-label">Guardian Phone</label>
                <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} className="field-input" />
              </div>
            </div>
            <div>
              <label className="field-label">Address</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="field-input" />
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
              <dt className="text-muted">Class</dt>
              <dd className="text-ink mt-0.5">{data.class ? `${data.class.name}-${data.class.section}` : 'Not yet assigned'}</dd>
            </div>
            <div>
              <dt className="text-muted">Roll Number</dt>
              <dd className="text-ink mt-0.5">{data.rollNumber || '—'}</dd>
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
              <dt className="text-muted">Guardian Name</dt>
              <dd className="text-ink mt-0.5">{data.guardianName || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Guardian Phone</dt>
              <dd className="text-ink mt-0.5">{data.guardianPhone || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Address</dt>
              <dd className="text-ink mt-0.5">{data.address || '—'}</dd>
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
