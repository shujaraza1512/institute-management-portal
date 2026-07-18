import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import SearchInput from '../../components/admin/SearchInput.jsx';
import Modal from '../../components/admin/Modal.jsx';

const emptyForm = { name: '', email: '', instituteId: '', password: '', phone: '', qualification: '', department: '' };

function Teachers() {
  const { data: lookups } = useFetch('/admin/lookups');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const endpoint = `/admin/teachers?search=${encodeURIComponent(search)}&status=${statusFilter}`;
  const { data: teachers, loading, error, refetch } = useFetch(endpoint);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [assignTarget, setAssignTarget] = useState(null); // teacher being assigned subjects/classes
  const [selectedPairs, setSelectedPairs] = useState([]); // [{classId, subjectId}]
  const [assignError, setAssignError] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({ name: t.name, email: t.email, instituteId: t.instituteId, password: '', phone: t.phone || '', qualification: t.qualification || '', department: t.department || '' });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.email.trim() || !form.instituteId.trim()) {
      setFormError('Name, email, and Institute ID are required.');
      return;
    }
    if (!editingId && form.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const { password, ...rest } = form;
        await api.put(`/admin/teachers/${editingId}`, rest);
      } else {
        await api.post('/admin/teachers', form);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (t) => {
    try {
      await api.put(`/admin/teachers/${t.id}/status`, { isActive: !t.isActive });
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not update status.');
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Permanently delete ${t.name}?`)) return;
    try {
      await api.delete(`/admin/teachers/${t.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this teacher.');
    }
  };

  const openAssign = async (t) => {
    setAssignTarget(t);
    setSelectedPairs([]);
    setAssignError('');
    try {
      const res = await api.get(`/admin/teachers/${t.id}/assignments`);
      setSelectedPairs(res.data.data);
    } catch (err) {
      setAssignError('Could not load current assignments. Saving now would clear them -- please close and try again.');
    }
  };

  const togglePair = (classId, subjectId) => {
    setSelectedPairs((prev) => {
      const exists = prev.some((p) => p.classId === classId && p.subjectId === subjectId);
      if (exists) return prev.filter((p) => !(p.classId === classId && p.subjectId === subjectId));
      return [...prev, { classId, subjectId }];
    });
  };

  const saveAssignments = async () => {
    setAssignError('');
    try {
      await api.put(`/admin/teachers/${assignTarget.id}/assignments`, { assignments: selectedPairs });
      setAssignTarget(null);
      refetch();
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Could not save assignments.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Manage Teachers</h2>
        <button onClick={openCreate} className="btn-primary btn-sm">
          + Add Teacher
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or Institute ID…" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-navy-100 rounded-card text-sm">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading teachers…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : teachers.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No teachers found" />
      ) : (
        <DataTable>
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Institute ID</th>
                <th className="px-4 py-3">Qualification</th>
                <th className="px-4 py-3">Subjects</th>
                <th className="px-4 py-3">Classes</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3">{t.instituteId}</td>
                  <td className="px-4 py-3">{t.qualification || '—'}</td>
                  <td className="px-4 py-3">{t.subjects.length ? t.subjects.join(', ') : '—'}</td>
                  <td className="px-4 py-3">{t.classes.length ? t.classes.join(', ') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-card ${t.isActive ? 'bg-approve/10 text-approve' : 'bg-reject/10 text-reject'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => openEdit(t)} className="btn-link-sm">Edit</button>
                      <button onClick={() => openAssign(t)} className="btn-link-sm">Assign</button>
                      <button onClick={() => toggleStatus(t)} className="text-xs text-pending hover:underline">
                        {t.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(t)} className="btn-link-danger-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      {showForm && (
        <Modal title={editingId ? 'Edit Teacher' : 'Add Teacher'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Institute ID</label>
                <input type="text" value={form.instituteId} onChange={(e) => setForm({ ...form, instituteId: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              {!editingId && (
                <div>
                  <label className="field-label">Password</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
                </div>
              )}
              <div>
                <label className="field-label">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Qualification</label>
                <input type="text" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Department</label>
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
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

      {assignTarget && (
        <Modal title={`Assign Subjects & Classes — ${assignTarget.name}`} onClose={() => setAssignTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Select every class + subject pair this teacher should teach. This replaces their current assignments entirely.
            </p>
            <div className="max-h-64 overflow-y-auto border border-navy-100 rounded-card p-3 space-y-2">
              {lookups?.classes.map((c) =>
                lookups.subjects.map((s) => {
                  const checked = selectedPairs.some((p) => p.classId === c.id && p.subjectId === s.id);
                  return (
                    <label key={`${c.id}-${s.id}`} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={checked} onChange={() => togglePair(c.id, s.id)} />
                      {c.name} · {s.name}
                    </label>
                  );
                })
              )}
            </div>
            {assignError && <p className="text-sm text-reject">{assignError}</p>}
            <div className="flex gap-3">
              <button onClick={saveAssignments} className="btn-primary">
                Save Assignments
              </button>
              <button onClick={() => setAssignTarget(null)} className="btn-link">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Teachers;
