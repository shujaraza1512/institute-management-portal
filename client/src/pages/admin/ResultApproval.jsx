import { useMemo, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import SearchInput from '../../components/admin/SearchInput.jsx';
import Modal from '../../components/admin/Modal.jsx';
import StatusBadge from '../../components/teacher/StatusBadge.jsx';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function ResultApproval() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');
  const [rejectTarget, setRejectTarget] = useState(null); // the result row being rejected
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    return `/admin/results?${params.toString()}`;
  }, [status, search]);

  const { data, loading, error, refetch } = useFetch(endpoint);

  const handleApprove = async (row) => {
    setActionError('');
    setBusyId(row.id);
    try {
      await api.put(`/admin/results/${row.id}/approve`);
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not approve this result.');
    } finally {
      setBusyId(null);
    }
  };

  const openReject = (row) => {
    setRejectTarget(row);
    setRejectReason('');
    setActionError('');
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    try {
      await api.put(`/admin/results/${rejectTarget.id}/reject`, { reason: rejectReason });
      setRejectTarget(null);
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not reject this result.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display text-navy-800">Result Approval</h2>
        <p className="text-sm text-muted mt-1">Only approved results become visible to students in the Student Portal.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-3 py-1.5 text-sm rounded-card border transition-colors ${
                status === tab.value ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-ink border-navy-100 hover:border-navy-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search student, ID, or class…" />
      </div>

      {actionError && <p className="text-sm text-reject">{actionError}</p>}

      {loading ? (
        <LoadingState label="Loading results…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No results found" description="Try a different filter or search term." />
      ) : (
        <DataTable>
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Roll #</th>
                <th className="px-4 py-3">Institute ID</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{r.studentName}</td>
                  <td className="px-4 py-3">{r.rollNumber}</td>
                  <td className="px-4 py-3">{r.instituteId}</td>
                  <td className="px-4 py-3">{r.class}</td>
                  <td className="px-4 py-3">{r.subject}</td>
                  <td className="px-4 py-3">{r.marks}/{r.totalMarks} ({r.percentage}%)</td>
                  <td className="px-4 py-3">{r.grade}</td>
                  <td className="px-4 py-3">{r.teacher || '—'}</td>
                  <td className="px-4 py-3">{new Date(r.submittedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                    {r.status === 'rejected' && r.rejectionReason && (
                      <p className="text-xs text-muted mt-1 max-w-[10rem]">{r.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(r)}
                          disabled={busyId === r.id}
                          className="text-xs text-approve hover:underline disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button onClick={() => openReject(r)} className="btn-link-danger-sm">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">
                        {r.reviewedBy ? `by ${r.reviewedBy}` : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      {rejectTarget && (
        <Modal title={`Reject result for ${rejectTarget.studentName}`} onClose={() => setRejectTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {rejectTarget.subject} · {rejectTarget.month} · {rejectTarget.marks}/{rejectTarget.totalMarks}
            </p>
            <div>
              <label className="field-label">Reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="field-input"
                placeholder="Let the teacher know what needs to change…"
              />
            </div>
            {actionError && <p className="text-sm text-reject">{actionError}</p>}
            <div className="flex gap-3">
              <button
                onClick={submitReject}
                disabled={busyId === rejectTarget.id}
                className="px-5 py-2.5 bg-reject text-white rounded-card shadow-card hover:opacity-90 disabled:opacity-60"
              >
                {busyId === rejectTarget.id ? 'Rejecting…' : 'Reject Result'}
              </button>
              <button onClick={() => setRejectTarget(null)} className="btn-link">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ResultApproval;
