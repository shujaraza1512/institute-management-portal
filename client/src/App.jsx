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
import StudentAssignments from './pages/student/Assignments.jsx';
import StudentLectureMaterials from './pages/student/LectureMaterials.jsx';
import StudentPaperSchedule from './pages/student/PaperSchedule.jsx';
import StudentAnnouncements from './pages/student/Announcements.jsx';
import StudentProfile from './pages/student/Profile.jsx';

import TeacherDashboard from './pages/teacher/Dashboard.jsx';
import TeacherResults from './pages/teacher/Results.jsx';
import TeacherAssignments from './pages/teacher/Assignments.jsx';
import TeacherLectureMaterials from './pages/teacher/LectureMaterials.jsx';
import TeacherTimetable from './pages/teacher/Timetable.jsx';
import TeacherAnnouncements from './pages/teacher/Announcements.jsx';
import TeacherProfile from './pages/teacher/Profile.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminResultApproval from './pages/admin/ResultApproval.jsx';
import AdminStudents from './pages/admin/Students.jsx';
import AdminStudentReport from './pages/admin/StudentReport.jsx';
import AdminTeachers from './pages/admin/Teachers.jsx';
import AdminClasses from './pages/admin/Classes.jsx';
import AdminSubjects from './pages/admin/Subjects.jsx';
import AdminAnnouncements from './pages/admin/Announcements.jsx';
import AdminTimetable from './pages/admin/Timetable.jsx';
import AdminPaperSchedules from './pages/admin/PaperSchedules.jsx';
import AdminProfile from './pages/admin/Profile.jsx';

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
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="lecture-materials" element={<StudentLectureMaterials />} />
        <Route path="paper-schedule" element={<StudentPaperSchedule />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Teacher portal — fully built out in Phase 6 */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="results" element={<TeacherResults />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="lecture-materials" element={<TeacherLectureMaterials />} />
        <Route path="timetable" element={<TeacherTimetable />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      {/* Examination Board (Admin) portal — fully built out in Phase 7 */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="results" element={<AdminResultApproval />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="students/:id/report" element={<AdminStudentReport />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="paper-schedules" element={<AdminPaperSchedules />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
