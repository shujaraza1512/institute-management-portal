import { BookOpen, Download, ExternalLink } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function LectureMaterials() {
  const { data, loading, error, refetch } = useFetch('/students/me/lecture-materials');

  if (loading) return <LoadingState label="Loading lecture materials…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No lecture materials yet"
        description="Notes, slides, and links from your teachers will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display text-navy-800">Lecture Materials</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((m) => (
          <div key={m.id} className="bg-white rounded-card shadow-card p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-navy-800">{m.title}</p>
              <span className="text-xs px-2 py-0.5 rounded-card bg-navy-100 text-navy-700 uppercase flex-shrink-0">{m.materialType}</span>
            </div>
            <p className="text-sm text-muted mt-1">{m.subject} · {m.teacher}</p>
            {m.description && <p className="text-sm text-ink mt-2">{m.description}</p>}
            <p className="text-xs text-muted mt-3">
              Uploaded {new Date(m.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            {m.hasFile && (
              <a
                href={`${API_BASE}/files/lecture-materials/${m.id}/download`}
                className="mt-2 inline-flex items-center gap-1 text-xs text-navy-700 hover:underline"
              >
                <Download className="w-3 h-3" /> Download File
              </a>
            )}
            {m.externalLink && (
              <a
                href={m.externalLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-sky-500 hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> View Link
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LectureMaterials;
