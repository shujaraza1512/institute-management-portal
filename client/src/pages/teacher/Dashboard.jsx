import { Link } from 'react-router-dom';
import { Layers, Users, CalendarClock, ClipboardList, Megaphone } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';

function TeacherDashboard() {
  const { data, loading, error, refetch } = useFetch('/teachers/me/dashboard');

  if (loading) return <LoadingState label="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const { teacher, assignedClassesCount, totalStudents, todaysLectures, pendingResultUploads, recentAnnouncements } = data;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card shadow-card p-6">
        <h2 className="text-xl font-display text-navy-800">Welcome back, {teacher.name.split(' ')[0]}</h2>
        <p className="text-sm text-muted mt-1">
          Employee ID: {teacher.instituteId} · Subjects:{' '}
          {teacher.assignedSubjects.length ? teacher.assignedSubjects.join(', ') : 'None assigned yet'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Layers} label="Assigned Classes" value={assignedClassesCount} />
        <SummaryCard icon={Users} label="Total Students" value={totalStudents} />
        <SummaryCard icon={CalendarClock} label="Today's Lectures" value={todaysLectures} />
        <SummaryCard icon={ClipboardList} label="Pending Result Uploads" value={pendingResultUploads} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/teacher/results" className="bg-white rounded-card shadow-card p-5 hover:shadow-lg transition-shadow">
          <p className="font-display text-navy-800">Upload Results</p>
          <p className="text-sm text-muted mt-1">Enter marks for your students.</p>
        </Link>
        <Link to="/teacher/assignments" className="bg-white rounded-card shadow-card p-5 hover:shadow-lg transition-shadow">
          <p className="font-display text-navy-800">Upload Assignment</p>
          <p className="text-sm text-muted mt-1">Create a new assignment for a class.</p>
        </Link>
        <Link to="/teacher/lecture-materials" className="bg-white rounded-card shadow-card p-5 hover:shadow-lg transition-shadow">
          <p className="font-display text-navy-800">Upload Lecture Material</p>
          <p className="text-sm text-muted mt-1">Share notes, slides, or a link.</p>
        </Link>
        <Link to="/teacher/timetable" className="bg-white rounded-card shadow-card p-5 hover:shadow-lg transition-shadow">
          <p className="font-display text-navy-800">View Timetable</p>
          <p className="text-sm text-muted mt-1">See your full weekly schedule.</p>
        </Link>
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-sky-500" />
          <p className="font-display text-navy-800">Recent Announcements</p>
        </div>
        {recentAnnouncements.length === 0 ? (
          <EmptyState title="No announcements yet" />
        ) : (
          <ul className="divide-y divide-navy-50 text-sm">
            {recentAnnouncements.map((a) => (
              <li key={a.id} className="py-3">
                <p className="text-ink">{a.title}</p>
                <p className="text-xs text-muted mt-0.5">{a.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
