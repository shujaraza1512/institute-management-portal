import { useState } from 'react';
import { Layers } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/admin/Modal.jsx';

const emptyForm = { name: '', section: '', classTeacherId: '' };

function Classes() {
  const { data: lookups } = useFetch('/admin/lookups');
  const { data: classes, loading, error, refetch } = useFetch('/admin/classes');

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

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, section: c.section, classTeacherId: c.classTeacherId || '' });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.section.trim()) {
      setFormError('Class name and section are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/classes/${editingId}`, form);
      } else {
        await api.post('/admin/classes', form);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete class ${c.name}-${c.section}?`)) return;
    try {
      await api.delete(`/admin/classes/${c.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this class.');
    }
  };

  if (loading) return <LoadingState label="Loading classes…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Manage Classes</h2>
        <button onClick={openCreate} className="px-4 py-2 text-sm bg-navy-700 text-white rounded-card shadow-card hover:bg-navy-800 transition-colors">
          + Add Class
        </button>
      </div>

      {classes.length === 0 ? (
        <EmptyState icon={Layers} title="No classes yet" description="Add one using the button above." />
      ) : (
        <DataTable>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Class Teacher</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.section}</td>
                  <td className="px-4 py-3">{c.classTeacher || '—'}</td>
                  <td className="px-4 py-3">{c.studentCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(c)} className="text-xs text-navy-700 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(c)} className="text-xs text-reject hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      {showForm && (
        <Modal title={editingId ? 'Edit Class' : 'Add Class'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-ink mb-1">Class Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 10" className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1">Section</label>
                <input type="text" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. A" className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Class Teacher</label>
              <select value={form.classTeacherId} onChange={(e) => setForm({ ...form, classTeacherId: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card">
                <option value="">None</option>
                {lookups?.teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {formError && <p className="text-sm text-reject">{formError}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-navy-700 text-white rounded-card shadow-card hover:bg-navy-800 disabled:opacity-60">
                {submitting ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-navy-700 hover:underline">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Classes;
