import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/admin/Modal.jsx';

const emptyForm = { name: '', code: '' };

function Subjects() {
  const { data: subjects, loading, error, refetch } = useFetch('/admin/subjects');

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

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name, code: s.code || '' });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/subjects/${editingId}`, form);
      } else {
        await api.post('/admin/subjects', form);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    try {
      await api.delete(`/admin/subjects/${s.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this subject.');
    }
  };

  if (loading) return <LoadingState label="Loading subjects…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Manage Subjects</h2>
        <button onClick={openCreate} className="btn-primary btn-sm">
          + Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState icon={BookOpen} title="No subjects yet" description="Add one using the button above." />
      ) : (
        <DataTable>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Assigned Teachers</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.code || '—'}</td>
                  <td className="px-4 py-3">{s.assignedTeachers.length ? s.assignedTeachers.join(', ') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(s)} className="btn-link-sm">Edit</button>
                      <button onClick={() => handleDelete(s)} className="btn-link-danger-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      {showForm && (
        <Modal title={editingId ? 'Edit Subject' : 'Add Subject'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Subject Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
            </div>
            <div>
              <label className="field-label">Subject Code</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
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

export default Subjects;
