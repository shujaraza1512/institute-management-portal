import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/admin/Modal.jsx';

const emptyForm = { examName: '', classId: '', subjectId: '', examDate: '', startTime: '', durationMinutes: '90', room: '' };

function PaperSchedules() {
  const { data: lookups } = useFetch('/admin/lookups');
  const { data: schedules, loading, error, refetch } = useFetch('/admin/paper-schedules');

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
    setForm({
      examName: s.examName, classId: String(s.classId), subjectId: String(s.subjectId),
      examDate: s.examDate, startTime: s.startTime, durationMinutes: String(s.durationMinutes), room: s.room || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.examName.trim() || !form.classId || !form.subjectId || !form.examDate || !form.startTime) {
      setFormError('Exam name, class, subject, date, and time are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/paper-schedules/${editingId}`, form);
      } else {
        await api.post('/admin/paper-schedules', form);
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
    if (!window.confirm(`Delete "${s.examName}"?`)) return;
    try {
      await api.delete(`/admin/paper-schedules/${s.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this entry.');
    }
  };

  if (loading) return <LoadingState label="Loading paper schedules…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Paper Schedule Management</h2>
        <button onClick={openCreate} className="btn-primary btn-sm">
          + Add Exam
        </button>
      </div>

      {schedules.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No paper schedules yet" description="Add one using the button above." />
      ) : (
        <DataTable>
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{s.examName}</td>
                  <td className="px-4 py-3">{s.class}</td>
                  <td className="px-4 py-3">{s.subject}</td>
                  <td className="px-4 py-3">{s.examDate}</td>
                  <td className="px-4 py-3">{s.startTime}</td>
                  <td className="px-4 py-3">{s.durationMinutes} min</td>
                  <td className="px-4 py-3">{s.room || '—'}</td>
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
        <Modal title={editingId ? 'Edit Exam' : 'Add Exam'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Exam Name</label>
              <input type="text" value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} placeholder="e.g. Mid-Term Examination" className="w-full px-3 py-2 border border-navy-100 rounded-card" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Class</label>
                <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card">
                  <option value="">Select a class</option>
                  {lookups?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Subject</label>
                <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card">
                  <option value="">Select a subject</option>
                  {lookups?.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Exam Date</label>
                <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Start Time</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Duration (minutes)</label>
                <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Room</label>
                <input type="text" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
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

export default PaperSchedules;
