// Central definition of each role's sidebar, so DashboardLayout itself
// stays generic and doesn't need to know about roles.
export const studentSidebarLinks = [
  { label: 'Dashboard', path: '/student/dashboard' },
  { label: 'Results', path: '/student/results' },
  { label: 'Progress', path: '/student/progress' },
  { label: 'Timetable', path: '/student/timetable' },
  { label: 'Assignments', path: '/student/assignments' },
  { label: 'Lecture Materials', path: '/student/lecture-materials' },
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

// Phase 7 replaced the original placeholder nav (which included "Upload
// Final Results" and "Settings" -- neither built per the detailed Phase 7
// spec) with the actual page set: Result Approval is the real workflow
// name for what the spec called "Upload Final Results"/"Approve Teacher
// Uploads" (they're the same screen once results are entered directly
// rather than uploaded, matching Phase 6's redesign); Student Reports links
// to the detailed report from within Student Management instead of a
// separate top-level nav item, since it's accessed per-student, not browsed
// on its own.
export const adminSidebarLinks = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Result Approval', path: '/admin/results' },
  { label: 'Manage Students', path: '/admin/students' },
  { label: 'Manage Teachers', path: '/admin/teachers' },
  { label: 'Manage Classes', path: '/admin/classes' },
  { label: 'Manage Subjects', path: '/admin/subjects' },
  { label: 'Announcements', path: '/admin/announcements' },
  { label: 'Timetable', path: '/admin/timetable' },
  { label: 'Paper Schedule', path: '/admin/paper-schedules' },
];
