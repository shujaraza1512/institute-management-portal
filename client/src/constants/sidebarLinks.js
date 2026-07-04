// Central definition of each role's sidebar, so DashboardLayout itself
// stays generic and doesn't need to know about roles.
export const studentSidebarLinks = [
  { label: 'Dashboard', path: '/student/dashboard' },
  { label: 'Results', path: '/student/results' },
  { label: 'Progress', path: '/student/progress' },
  { label: 'Timetable', path: '/student/timetable' },
  { label: 'Paper Schedule', path: '/student/paper-schedule' },
  { label: 'Profile', path: '/student/profile' },
];

export const teacherSidebarLinks = [
  { label: 'Dashboard', path: '/teacher/dashboard' },
  { label: 'Upload Results', path: '/teacher/upload-results' },
  { label: 'Upload Lecture Units', path: '/teacher/upload-lecture-units' },
  { label: 'Upload Monthly Paper', path: '/teacher/upload-monthly-paper' },
  { label: 'My Classes', path: '/teacher/classes' },
  { label: 'Profile', path: '/teacher/profile' },
];

export const adminSidebarLinks = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Manage Students', path: '/admin/students' },
  { label: 'Manage Teachers', path: '/admin/teachers' },
  { label: 'Manage Subjects', path: '/admin/subjects' },
  { label: 'Manage Classes', path: '/admin/classes' },
  { label: 'Upload Final Results', path: '/admin/final-results' },
  { label: 'Approve Teacher Uploads', path: '/admin/approvals' },
  { label: 'Announcements', path: '/admin/announcements' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Settings', path: '/admin/settings' },
];
