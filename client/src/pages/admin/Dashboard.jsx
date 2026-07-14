import { Users, GraduationCap, Layers, BookOpen, ClipboardCheck, CheckCircle2, ClipboardList, Megaphone } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';
import StatusBadge from '../../components/teacher/StatusBadge.jsx';

function AdminDashboard() {
  const { data, loading, error, refetch } = useFetch('/admin/dashboard');

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const {
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    pendingResultApprovals,
    approvedResults,
    pendingAssignments,
    activeAnnouncements,
    recentActivity,
  } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display text-navy-800">Examination Board Dashboard</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Total Students" value={totalStudents} />
        <SummaryCard icon={GraduationCap} label="Total Teachers" value={totalTeachers} />
        <SummaryCard icon={Layers} label="Total Classes" value={totalClasses} />
        <SummaryCard icon={BookOpen} label="Total Subjects" value={totalSubjects} />
        <SummaryCard icon={ClipboardCheck} label="Pending Result Approvals" value={pendingResultApprovals} />
        <SummaryCard icon={CheckCircle2} label="Approved Results" value={approvedResults} />
        <SummaryCard icon={ClipboardList} label="Pending Assignments" value={pendingAssignments} />
        <SummaryCard icon={Megaphone} label="Active Announcements" value={activeAnnouncements} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-card shadow-card p-6">
          <p className="font-display text-navy-800 mb-4">Recently Uploaded Results</p>
          {recentActivity.results.length === 0 ? (
            <EmptyState title="No results yet" />
          ) : (
            <ul className="divide-y divide-navy-50 text-sm">
              {recentActivity.results.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink">{r.student} · {r.subject}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-muted mt-0.5">{r.month}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-card shadow-card p-6">
          <p className="font-display text-navy-800 mb-4">Recently Created Assignments</p>
          {recentActivity.assignments.length === 0 ? (
            <EmptyState title="No assignments yet" />
          ) : (
            <ul className="divide-y divide-navy-50 text-sm">
              {recentActivity.assignments.map((a) => (
                <li key={a.id} className="py-3">
                  <p className="text-ink">{a.title}</p>
                  <p className="text-xs text-muted mt-0.5">{a.class} · {a.subject}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-card shadow-card p-6">
          <p className="font-display text-navy-800 mb-4">Recent Announcements</p>
          {recentActivity.announcements.length === 0 ? (
            <EmptyState title="No announcements yet" />
          ) : (
            <ul className="divide-y divide-navy-50 text-sm">
              {recentActivity.announcements.map((a) => (
                <li key={a.id} className="py-3">
                  <p className="text-ink">{a.title}</p>
                  <p className="text-xs text-muted mt-0.5 capitalize">{a.audience}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
