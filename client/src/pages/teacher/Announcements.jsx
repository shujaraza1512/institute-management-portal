import { Megaphone, BellOff } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

function Announcements() {
  const { data, loading, error, refetch } = useFetch('/teachers/me/announcements');

  if (loading) return <LoadingState label="Loading announcements…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data.length) {
    return <EmptyState icon={BellOff} title="No announcements yet" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display text-navy-800">Announcements</h2>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-card shadow-card p-5">
            <div className="flex items-center gap-2 text-sky-500">
              <Megaphone className="w-4 h-4" />
              <span className="text-xs font-medium">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p className="mt-2 font-display text-navy-800">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Announcements;
