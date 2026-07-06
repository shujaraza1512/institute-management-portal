import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/public/Home.jsx';
import Login from './pages/auth/Login.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import StudentLayout from './layouts/StudentLayout.jsx';
import TeacherLayout from './layouts/TeacherLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentResults from './pages/student/Results.jsx';
import StudentProgress from './pages/student/Progress.jsx';
import StudentTimetable from './pages/student/Timetable.jsx';
import StudentPaperSchedule from './pages/student/PaperSchedule.jsx';
import StudentAnnouncements from './pages/student/Announcements.jsx';
import StudentProfile from './pages/student/Profile.jsx';

import TeacherDashboard from './pages/teacher/Dashboard.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';

function App() {
  return (
    <Routes>
      {/* Public pages — fully built out in Phase 4 */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Student portal — fully built out in Phase 5 */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="paper-schedule" element={<StudentPaperSchedule />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Teacher portal — Upload pages/My Classes added in Phase 6 */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TeacherDashboard />} />
      </Route>

      {/* Examination Board (Admin) portal — management pages added in Phase 7 */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
