import { TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

function Progress() {
  const { data, loading, error, refetch } = useFetch('/students/me/progress');

  if (loading) return <LoadingState label="Loading progress…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const { monthlyTrend, subjectPerformance, overallAverage } = data;

  if (!monthlyTrend.length && !subjectPerformance.length) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No progress data yet"
        description="Progress charts will appear once the Examination Board publishes results."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display text-navy-800">Progress</h2>
        <p className="text-sm text-muted">
          Overall average: <span className="font-medium text-navy-800">{overallAverage !== null ? `${overallAverage}%` : '—'}</span>
        </p>
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        <p className="font-display text-navy-800 mb-4">Monthly Trend</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid stroke="#D3E3EA" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="average" stroke="#225775" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        <p className="font-display text-navy-800 mb-4">Subject-wise Performance</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={subjectPerformance}>
            <CartesianGrid stroke="#D3E3EA" strokeDasharray="3 3" />
            <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="average" fill="#95C83E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Progress;
