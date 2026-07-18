import DashboardLayout from './DashboardLayout.jsx';
import { adminSidebarLinks } from '../constants/sidebarLinks.js';

function AdminLayout() {
  return <DashboardLayout sidebarItems={adminSidebarLinks} roleLabel="Examination Board" profilePath="/admin/profile" />;
}

export default AdminLayout;
