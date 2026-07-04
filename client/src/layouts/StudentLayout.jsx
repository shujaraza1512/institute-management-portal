import DashboardLayout from './DashboardLayout.jsx';
import { studentSidebarLinks } from '../constants/sidebarLinks.js';

function StudentLayout() {
  return <DashboardLayout sidebarItems={studentSidebarLinks} roleLabel="Student" />;
}

export default StudentLayout;
