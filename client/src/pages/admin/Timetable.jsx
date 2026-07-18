import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/admin/Modal.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const emptyForm = { classId: '', subjectId: '', teacherId: '', day: 'Monday', startTime: '', endTime: '', room: '' };

function TimetableManagement() {
  const { data: lookups } = useFetch('/admin/lookups');
  const { data: entries, loading, error, refetch } = useFetch('/admin/timetable');

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

  const openEdit = (e) => {
    setEditingId(e.id);
    setForm({ classId: String(e.classId), subjectId: String(e.subjectId), teacherId: String(e.teacherId), day: e.day, startTime: e.startTime, endTime: e.endTime, room: e.room || '' });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setFormError('');
    if (!form.classId || !form.subjectId || !form.teacherId || !form.startTime || !form.endTime) {
      setFormError('All fields except room are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/timetable/${editingId}`, form);
      } else {
        await api.post('/admin/timetable', form);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      await api.delete(`/admin/timetable/${e.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this entry.');
    }
  };

  if (loading) return <LoadingState label="Loading timetable…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Timetable Management</h2>
        <button onClick={openCreate} className="btn-primary btn-sm">
          + Add Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No timetable entries yet" description="Add one using the button above." />
      ) : (
        <DataTable>
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{e.day}</td>
                  <td className="px-4 py-3">{e.startTime} – {e.endTime}</td>
                  <td className="px-4 py-3">{e.class}</td>
                  <td className="px-4 py-3">{e.subject}</td>
                  <td className="px-4 py-3">{e.teacher}</td>
                  <td className="px-4 py-3">{e.room || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(e)} className="btn-link-sm">Edit</button>
                      <button onClick={() => handleDelete(e)} className="btn-link-danger-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      {showForm && (
        <Modal title={editingId ? 'Edit Timetable Entry' : 'Add Timetable Entry'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="field-label">Teacher</label>
                <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card">
                  <option value="">Select a teacher</option>
                  {lookups?.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Day</label>
                <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card">
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Start Time</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">End Time</label>
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div className="sm:col-span-2">
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

export default TimetableManagement;
