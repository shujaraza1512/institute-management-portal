import { Link } from 'react-router-dom';
import { BookOpen, CalendarClock, Award, Megaphone, ClipboardList, FileText } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';

function StudentDashboard() {
  const { data, loading, error, refetch } = useFetch('/students/me/dashboard');

  if (loading) return <LoadingState label="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const { student, attendancePercentage, overallAverage, subjectsCount, upcomingExam, latestResult, announcementsCount, recentAssignments, recentLectureMaterials } = data;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card shadow-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display text-navy-800">Welcome back, {student.name.split(' ')[0]}</h2>
          <p className="text-sm text-muted mt-1">
            {student.class ? `Class ${student.class}` : 'Class not yet assigned'} · Institute ID: {student.instituteId}
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-display text-navy-700">
              {attendancePercentage !== null ? `${attendancePercentage}%` : '—'}
            </p>
            <p className="text-xs text-muted">Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display text-navy-700">{overallAverage !== null ? `${overallAverage}%` : '—'}</p>
            <p className="text-xs text-muted">Overall Average</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={BookOpen} label="Subjects" value={subjectsCount} />
        <SummaryCard
          icon={CalendarClock}
          label="Upcoming Exam"
          value={upcomingExam ? upcomingExam.subject : 'None scheduled'}
          sublabel={
            upcomingExam
              ? new Date(upcomingExam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : undefined
          }
        />
        <SummaryCard
          icon={Award}
          label="Latest Result"
          value={latestResult ? `${latestResult.grade} · ${latestResult.percentage}%` : 'No results yet'}
          sublabel={latestResult ? latestResult.subject : undefined}
        />
        <SummaryCard icon={Megaphone} label="Announcements" value={announcementsCount} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link to="/student/results" className="text-navy-700 hover:underline">View Results →</Link>
        <Link to="/student/progress" className="text-navy-700 hover:underline">View Progress →</Link>
        <Link to="/student/timetable" className="text-navy-700 hover:underline">View Timetable →</Link>
      </div>

      {/* Added in Phase 7.5 -- extends the dashboard, existing cards/links above are unchanged. */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-sky-500" />
              <p className="font-display text-navy-800">Recent Assignments</p>
            </div>
            <Link to="/student/assignments" className="text-xs text-navy-700 hover:underline">View all →</Link>
          </div>
          {recentAssignments.length === 0 ? (
            <EmptyState title="No assignments yet" />
          ) : (
            <ul className="divide-y divide-navy-50 text-sm">
              {recentAssignments.map((a) => (
                <li key={a.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-ink truncate">{a.title}</p>
                    <p className="text-xs text-muted">{a.subject}</p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">
                    Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-500" />
              <p className="font-display text-navy-800">Recent Lecture Materials</p>
            </div>
            <Link to="/student/lecture-materials" className="text-xs text-navy-700 hover:underline">View all →</Link>
          </div>
          {recentLectureMaterials.length === 0 ? (
            <EmptyState title="No materials yet" />
          ) : (
            <ul className="divide-y divide-navy-50 text-sm">
              {recentLectureMaterials.map((m) => (
                <li key={m.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-ink truncate">{m.title}</p>
                    <p className="text-xs text-muted">{m.subject}</p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {new Date(m.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
