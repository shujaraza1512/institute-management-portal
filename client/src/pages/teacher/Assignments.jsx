import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ClassSubjectFields from '../../components/teacher/ClassSubjectFields.jsx';

const emptyForm = { classId: '', subjectId: '', title: '', description: '', dueDate: '', attachment: null };

function Assignments() {
  const { data: classes, loading: classesLoading, error: classesError } = useFetch('/teachers/me/classes');
  const { data: assignments, loading, error, refetch } = useFetch('/teachers/me/assignments');

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
    setForm({ classId: String(a.classId), subjectId: String(a.subjectId), title: a.title, description: a.description || '', dueDate: a.dueDate, attachment: null });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!editingId && (!form.classId || !form.subjectId)) {
      setFormError('Please select a class and subject.');
      return;
    }
    if (!form.title.trim() || !form.dueDate) {
      setFormError('Title and due date are required.');
      return;
    }

    const body = new FormData();
    if (form.classId) body.append('classId', form.classId);
    if (form.subjectId) body.append('subjectId', form.subjectId);
    body.append('title', form.title);
    body.append('description', form.description);
    body.append('dueDate', form.dueDate);
    if (form.attachment) body.append('attachment', form.attachment);

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/teachers/me/assignments/${editingId}`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/teachers/me/assignments', body, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      await api.delete(`/teachers/me/assignments/${a.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this assignment.');
    }
  };

  if (classesLoading || loading) return <LoadingState label="Loading assignments…" />;
  if (classesError) return <ErrorState message={classesError} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Assignments</h2>
        {classes.length > 0 && (
          <button onClick={openCreate} className="btn-primary btn-sm">
            + New Assignment
          </button>
        )}
      </div>

      {classes.length === 0 ? (
        <EmptyState title="No classes assigned yet" description="Contact the Examination Board to get assigned to a class and subject." />
      ) : (
        <>
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 space-y-4">
              <p className="font-display text-navy-800">{editingId ? 'Edit Assignment' : 'New Assignment'}</p>

              {!editingId && (
                <ClassSubjectFields
                  classes={classes}
                  classId={form.classId}
                  subjectId={form.subjectId}
                  onClassChange={(v) => setForm({ ...form, classId: v })}
                  onSubjectChange={(v) => setForm({ ...form, subjectId: v })}
                />
              )}

              <div>
                <label className="field-label">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="field-input"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="field-label">Attachment (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={(e) => setForm({ ...form, attachment: e.target.files[0] })}
                    className="w-full text-sm"
                  />
                </div>
              </div>

              {formError && <p className="text-sm text-reject">{formError}</p>}

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-link">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {assignments.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No assignments yet" description="Create one using the button above." />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {assignments.map((a) => (
                <div key={a.id} className="bg-white rounded-card shadow-card p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-navy-800">{a.title}</p>
                    <span className="text-xs text-muted whitespace-nowrap">Due {a.dueDate}</span>
                  </div>
                  <p className="text-sm text-muted mt-1">{a.class} · {a.subject}</p>
                  {a.description && <p className="text-sm text-ink mt-2">{a.description}</p>}
                  <div className="flex gap-4 mt-4">
                    <button onClick={() => openEdit(a)} className="btn-link-sm">Edit</button>
                    <button onClick={() => handleDelete(a)} className="btn-link-danger-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Assignments;
