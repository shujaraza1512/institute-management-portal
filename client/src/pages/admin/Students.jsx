import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import SearchInput from '../../components/admin/SearchInput.jsx';
import Modal from '../../components/admin/Modal.jsx';

const emptyForm = {
  name: '', email: '', instituteId: '', password: '', rollNumber: '', phone: '',
  guardianName: '', guardianPhone: '', address: '', classId: '', admissionDate: '',
};

function Students() {
  const { data: lookups } = useFetch('/admin/lookups');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const endpoint = `/admin/students?search=${encodeURIComponent(search)}&classId=${classFilter}&status=${statusFilter}`;
  const { data: students, loading, error, refetch } = useFetch(endpoint);

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
      name: s.name, email: s.email, instituteId: s.instituteId, password: '',
      rollNumber: s.rollNumber || '', phone: s.phone || '', guardianName: s.guardianName || '',
      guardianPhone: s.guardianPhone || '', address: s.address || '', classId: s.classId || '',
      admissionDate: s.admissionDate || '',
    });
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
        await api.put(`/admin/students/${editingId}`, rest);
      } else {
        await api.post('/admin/students', form);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (s) => {
    try {
      await api.put(`/admin/students/${s.id}/status`, { isActive: !s.isActive });
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not update status.');
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Permanently delete ${s.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/students/${s.id}`);
      refetch();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete this student.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Manage Students</h2>
        <button onClick={openCreate} className="btn-primary btn-sm">
          + Add Student
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, roll #, or Institute ID…" />
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-3 py-2 border border-navy-100 rounded-card text-sm">
          <option value="">All Classes</option>
          {lookups?.classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-navy-100 rounded-card text-sm">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading students…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : students.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="Try a different search or add a new student." />
      ) : (
        <DataTable>
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Institute ID</th>
                <th className="px-4 py-3">Roll #</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.instituteId}</td>
                  <td className="px-4 py-3">{s.rollNumber || '—'}</td>
                  <td className="px-4 py-3">{s.class || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-card ${s.isActive ? 'bg-approve/10 text-approve' : 'bg-reject/10 text-reject'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link to={`/admin/students/${s.id}/report`} className="btn-link-sm inline-flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Report
                      </Link>
                      <button onClick={() => openEdit(s)} className="btn-link-sm">Edit</button>
                      <button onClick={() => toggleStatus(s)} className="text-xs text-pending hover:underline">
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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
        <Modal title={editingId ? 'Edit Student' : 'Add Student'} onClose={() => setShowForm(false)} maxWidth="max-w-2xl">
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
                <label className="field-label">Roll Number</label>
                <input type="text" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Class</label>
                <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card">
                  <option value="">Unassigned</option>
                  {lookups?.classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Admission Date</label>
                <input type="date" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Guardian Name</label>
                <input type="text" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
              <div>
                <label className="field-label">Guardian Phone</label>
                <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
              </div>
            </div>
            <div>
              <label className="field-label">Address</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-3 py-2 border border-navy-100 rounded-card" />
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

export default Students;
