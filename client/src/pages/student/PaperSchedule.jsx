import { CalendarX } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

function PaperSchedule() {
  const { data, loading, error, refetch } = useFetch('/students/me/paper-schedule');

  if (loading) return <LoadingState label="Loading paper schedule…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data.length) {
    return (
      <EmptyState
        icon={CalendarX}
        title="No upcoming exams"
        description="Check back once the Examination Board schedules the next exams."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display text-navy-800">Paper Schedule</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((exam) => (
          <div key={exam.id} className="bg-white rounded-card shadow-card p-5">
            <p className="font-display text-navy-800">{exam.subject}</p>
            <p className="text-sm text-muted mt-2">
              {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-muted">{exam.time} · {exam.durationMinutes} min</p>
            <p className="text-sm text-muted">Room: {exam.room || 'TBA'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaperSchedule;
