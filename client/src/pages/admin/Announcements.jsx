import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/admin/Modal.jsx';

const toDateInputValue = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const emptyForm = { title: '', description: '', audience: 'all', publishAt: '', expiryDate: '' };

function Announcements() {
  const { data: announcements, loading, error, refetch } = useFetch('/admin/announcements');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      description: a.description,
      audience: a.audience,
      publishAt: toDateInputValue(a.publishAt),
      expiryDate: toDateInputValue(a.expiryDate),
    });
    setFormError('');
    setShowForm(true);
  };

  const isActive = (a) => {
    const now = new Date();
    return new Date(a.publishAt) <= now && (!a.expiryDate || new Date(a.expiryDate) >= now);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const body = { ...form, publishAt: form.publishAt || undefined, expiryDate: form.expiryDate || null };
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, body);
      } else {
        await api.post('/admin/announcements', body);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return;
    try {
      await api.delete(`/admin/announcements/${a.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this announcement.');
    }
  };

  if (loading) return <LoadingState label="Loading announcements…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Announcements</h2>
        <button onClick={openCreate} className="btn-primary btn-sm">
          + New Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Create one using the button above." />
      ) : (
        <DataTable>
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Publish Date</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{a.title}</td>
                  <td className="px-4 py-3 capitalize">{a.audience}</td>
                  <td className="px-4 py-3">{new Date(a.publishAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{a.expiryDate ? new Date(a.expiryDate).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-card ${isActive(a) ? 'bg-approve/10 text-approve' : 'bg-navy-100 text-muted'}`}>
                      {isActive(a) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(a)} className="btn-link-sm">Edit</button>
                      <button onClick={() => handleDelete(a)} className="btn-link-danger-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      {showForm && (
        <Modal title={editingId ? 'Edit Announcement' : 'New Announcement'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
            </div>
            <div>
              <label className="field-label">Audience</label>
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card">
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Publish Date</label>
                <input type="date" value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
                <p className="text-xs text-muted mt-1">Leave blank to publish immediately.</p>
              </div>
              <div>
                <label className="field-label">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
                <p className="text-xs text-muted mt-1">Leave blank to never expire.</p>
              </div>
            </div>

            {formError && <p className="text-sm text-reject">{formError}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-link">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Announcements;
