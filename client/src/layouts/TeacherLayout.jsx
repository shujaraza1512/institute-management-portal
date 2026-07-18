import DashboardLayout from './DashboardLayout.jsx';
import { teacherSidebarLinks } from '../constants/sidebarLinks.js';

function TeacherLayout() {
  return <DashboardLayout sidebarItems={teacherSidebarLinks} roleLabel="Teacher" profilePath="/teacher/profile" />;
}

export default TeacherLayout;
