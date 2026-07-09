// Central definition of each role's sidebar, so DashboardLayout itself
// stays generic and doesn't need to know about roles.
export const studentSidebarLinks = [
  { label: 'Dashboard', path: '/student/dashboard' },
  { label: 'Results', path: '/student/results' },
  { label: 'Progress', path: '/student/progress' },
  { label: 'Timetable', path: '/student/timetable' },
  { label: 'Paper Schedule', path: '/student/paper-schedule' },
  { label: 'Announcements', path: '/student/announcements' },
  { label: 'Profile', path: '/student/profile' },
];

// Phase 6 replaced the original file-upload-based Teacher Portal (Upload
// Results/Upload Lecture Units/Upload Monthly Paper/My Classes) with a
// CRUD-based one per the detailed Phase 6 spec -- results are entered
// directly per-student rather than uploaded as a file, and "My Classes" is
// folded into the Results page's class/subject selector + the Dashboard.
export const teacherSidebarLinks = [
  { label: 'Dashboard', path: '/teacher/dashboard' },
  { label: 'Results', path: '/teacher/results' },
  { label: 'Assignments', path: '/teacher/assignments' },
  { label: 'Lecture Materials', path: '/teacher/lecture-materials' },
  { label: 'Timetable', path: '/teacher/timetable' },
  { label: 'Announcements', path: '/teacher/announcements' },
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
