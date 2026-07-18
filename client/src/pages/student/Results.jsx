import { useMemo, useState } from 'react';
import { FileX } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

function Results() {
  const [month, setMonth] = useState('');
  const endpoint = useMemo(() => `/students/me/results${month ? `?month=${month}` : ''}`, [month]);
  const { data, loading, error, refetch } = useFetch(endpoint);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display text-navy-800">Results</h2>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-navy-100 rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {month && (
            <button onClick={() => setMonth('')} className="btn-link">
              Clear
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingState label="Loading results…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          icon={FileX}
          title="No results found"
          description={month ? 'Try a different month.' : 'Results will appear here once the Examination Board publishes them.'}
        />
      )}
      {!loading && !error && data && data.length > 0 && (
        <div className="bg-white rounded-card shadow-card overflow-x-auto data-table">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-muted border-b border-navy-100">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Exam Type</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">{r.subject}</td>
                  <td className="px-4 py-3">{r.examType}</td>
                  <td className="px-4 py-3">{r.marks}/{r.totalMarks}</td>
                  <td className="px-4 py-3">{r.grade || '—'}</td>
                  <td className="px-4 py-3">{r.percentage}%</td>
                  <td className="px-4 py-3">{r.position ? `#${r.position}` : '—'}</td>
                  <td className="px-4 py-3">{r.month}</td>
                  <td className="px-4 py-3 text-muted">{r.teacherRemarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Results;
