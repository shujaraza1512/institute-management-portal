import { ClipboardList, Download } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function Assignments() {
  const { data, loading, error, refetch } = useFetch('/students/me/assignments');

  if (loading) return <LoadingState label="Loading assignments…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No assignments yet"
        description="Assignments from your teachers will appear here as soon as they're posted."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display text-navy-800">Assignments</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((a) => (
          <div key={a.id} className="bg-white rounded-card shadow-card p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-navy-800">{a.title}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-card capitalize flex-shrink-0 ${
                  a.status === 'active' ? 'bg-approve/10 text-approve' : 'bg-navy-100 text-muted'
                }`}
              >
                {a.status}
              </span>
            </div>
            <p className="text-sm text-muted mt-1">{a.subject} · {a.teacher}</p>
            {a.description && <p className="text-sm text-ink mt-2">{a.description}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-xs text-muted">
              <span>Posted {new Date(a.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {a.hasAttachment && (
              <a
                href={`${API_BASE}/files/assignments/${a.id}/download`}
                className="mt-3 inline-flex items-center gap-1 text-xs text-navy-700 hover:underline"
              >
                <Download className="w-3 h-3" /> Download Attachment
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Assignments;
