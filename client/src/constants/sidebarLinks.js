import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  CalendarClock,
  ClipboardList,
  BookOpen,
  CalendarDays,
  Megaphone,
  User,
  ClipboardCheck,
  Users,
  GraduationCap,
  Layers,
} from 'lucide-react';

// Central definition of each role's sidebar, so DashboardLayout itself
// stays generic and doesn't need to know about roles. Phase 8 added an
// `icon` per item for visual scanability -- navigation structure/paths
// are unchanged from Phase 7.5.
export const studentSidebarLinks = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Results', path: '/student/results', icon: FileText },
  { label: 'Progress', path: '/student/progress', icon: TrendingUp },
  { label: 'Timetable', path: '/student/timetable', icon: CalendarClock },
  { label: 'Assignments', path: '/student/assignments', icon: ClipboardList },
  { label: 'Lecture Materials', path: '/student/lecture-materials', icon: BookOpen },
  { label: 'Paper Schedule', path: '/student/paper-schedule', icon: CalendarDays },
  { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
  { label: 'Profile', path: '/student/profile', icon: User },
];

// Phase 6 replaced the original file-upload-based Teacher Portal (Upload
// Results/Upload Lecture Units/Upload Monthly Paper/My Classes) with a
// CRUD-based one per the detailed Phase 6 spec -- results are entered
// directly per-student rather than uploaded as a file, and "My Classes" is
// folded into the Results page's class/subject selector + the Dashboard.
export const teacherSidebarLinks = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Results', path: '/teacher/results', icon: FileText },
  { label: 'Assignments', path: '/teacher/assignments', icon: ClipboardList },
  { label: 'Lecture Materials', path: '/teacher/lecture-materials', icon: BookOpen },
  { label: 'Timetable', path: '/teacher/timetable', icon: CalendarClock },
  { label: 'Announcements', path: '/teacher/announcements', icon: Megaphone },
  { label: 'Profile', path: '/teacher/profile', icon: User },
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
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Result Approval', path: '/admin/results', icon: ClipboardCheck },
  { label: 'Manage Students', path: '/admin/students', icon: Users },
  { label: 'Manage Teachers', path: '/admin/teachers', icon: GraduationCap },
  { label: 'Manage Classes', path: '/admin/classes', icon: Layers },
  { label: 'Manage Subjects', path: '/admin/subjects', icon: BookOpen },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'Timetable', path: '/admin/timetable', icon: CalendarClock },
  { label: 'Paper Schedule', path: '/admin/paper-schedules', icon: CalendarDays },
  { label: 'Profile', path: '/admin/profile', icon: User },
];
