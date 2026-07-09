import { useState } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ClassSubjectFields from '../../components/teacher/ClassSubjectFields.jsx';

const emptyForm = { classId: '', subjectId: '', title: '', description: '', materialType: 'notes', file: null, externalLink: '' };

function LectureMaterials() {
  const { data: classes, loading: classesLoading, error: classesError } = useFetch('/teachers/me/classes');
  const { data: materials, loading, error, refetch } = useFetch('/teachers/me/lecture-materials');

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

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({
      classId: String(m.classId),
      subjectId: String(m.subjectId),
      title: m.title,
      description: m.description || '',
      materialType: m.materialType,
      file: null,
      externalLink: m.externalLink || '',
    });
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
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!editingId && !form.file && !form.externalLink.trim()) {
      setFormError('Provide either a file or an external link.');
      return;
    }
    if (form.file && form.externalLink.trim()) {
      setFormError('Provide a file or a link, not both.');
      return;
    }

    const body = new FormData();
    if (form.classId) body.append('classId', form.classId);
    if (form.subjectId) body.append('subjectId', form.subjectId);
    body.append('title', form.title);
    body.append('description', form.description);
    body.append('materialType', form.materialType);
    if (form.file) body.append('file', form.file);
    if (form.externalLink) body.append('externalLink', form.externalLink);

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/teachers/me/lecture-materials/${editingId}`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/teachers/me/lecture-materials', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Delete "${m.title}"?`)) return;
    try {
      await api.delete(`/teachers/me/lecture-materials/${m.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this material.');
    }
  };

  if (classesLoading || loading) return <LoadingState label="Loading lecture materials…" />;
  if (classesError) return <ErrorState message={classesError} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Lecture Materials</h2>
        {classes.length > 0 && (
          <button onClick={openCreate} className="px-4 py-2 text-sm bg-navy-700 text-white rounded-card shadow-card hover:bg-navy-800 transition-colors">
            + New Material
          </button>
        )}
      </div>

      {classes.length === 0 ? (
        <EmptyState title="No classes assigned yet" description="Contact the Examination Board to get assigned to a class and subject." />
      ) : (
        <>
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 space-y-4">
              <p className="font-display text-navy-800">{editingId ? 'Edit Material' : 'New Material'}</p>

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
                <label className="block text-sm text-ink mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm text-ink mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm text-ink mb-1">Type</label>
                <select
                  value={form.materialType}
                  onChange={(e) => setForm({ ...form, materialType: e.target.value })}
                  className="w-full sm:w-48 px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="notes">Notes</option>
                  <option value="slides">Slides</option>
                  <option value="link">External Link</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink mb-1">File</label>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    onChange={(e) => setForm({ ...form, file: e.target.files[0], externalLink: '' })}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1">...or an External Link</label>
                  <input
                    type="url"
                    placeholder="https://…"
                    value={form.externalLink}
                    onChange={(e) => setForm({ ...form, externalLink: e.target.value, file: null })}
                    className="w-full px-3 py-2 border border-navy-100 rounded-card focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {formError && <p className="text-sm text-reject">{formError}</p>}

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-navy-700 text-white rounded-card shadow-card hover:bg-navy-800 disabled:opacity-60">
                  {submitting ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-navy-700 hover:underline">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {materials.length === 0 ? (
            <EmptyState icon={BookOpen} title="No lecture materials yet" description="Upload one using the button above." />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {materials.map((m) => (
                <div key={m.id} className="bg-white rounded-card shadow-card p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-navy-800">{m.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-card bg-navy-100 text-navy-700 uppercase">{m.materialType}</span>
                  </div>
                  <p className="text-sm text-muted mt-1">{m.class} · {m.subject}</p>
                  {m.description && <p className="text-sm text-ink mt-2">{m.description}</p>}
                  {m.externalLink && (
                    <a href={m.externalLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-sky-500 hover:underline">
                      <ExternalLink className="w-3 h-3" /> View Link
                    </a>
                  )}
                  <div className="flex gap-4 mt-4">
                    <button onClick={() => openEdit(m)} className="text-xs text-navy-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(m)} className="text-xs text-reject hover:underline">Delete</button>
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

export default LectureMaterials;
