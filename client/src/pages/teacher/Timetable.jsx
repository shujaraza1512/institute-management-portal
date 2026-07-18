import { CalendarX } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function Timetable() {
  const { data, loading, error, refetch } = useFetch('/teachers/me/timetable');
  const today = DAYS[new Date().getDay() - 1];

  if (loading) return <LoadingState label="Loading timetable…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data.length) {
    return <EmptyState icon={CalendarX} title="No timetable available" description="You have no scheduled classes yet." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display text-navy-800">My Timetable</h2>
      <div className="bg-white rounded-card shadow-card overflow-x-auto data-table">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-muted border-b border-navy-100">
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Room</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.id} className={`border-b border-navy-50 last:border-0 ${entry.day === today ? 'bg-sky-500/10' : ''}`}>
                <td className="px-4 py-3 font-medium">
                  {entry.day}
                  {entry.day === today && <span className="ml-2 text-xs text-sky-500 font-normal">Today</span>}
                </td>
                <td className="px-4 py-3">{entry.startTime} – {entry.endTime}</td>
                <td className="px-4 py-3">{entry.class}</td>
                <td className="px-4 py-3">{entry.subject}</td>
                <td className="px-4 py-3">{entry.room || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Timetable;
