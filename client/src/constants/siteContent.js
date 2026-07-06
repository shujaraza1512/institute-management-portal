// Central place to customize the public-facing site — institute name,
// tagline, about copy, stats, features, and contact/social details all
// live here so none of it needs to be hunted down inside component markup.
// Update this one file to rebrand the whole homepage.
import { TrendingUp, FileText, CalendarDays, ClipboardCheck, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const INSTITUTE_NAME = 'Crescent Institute of Sciences';

export const INSTITUTE_TAGLINE =
  'Empowering students through structured learning, transparent results, and a modern examination system.';

export const ABOUT_TEXT =
  'For years, our institute has combined disciplined teaching with modern technology to give every student a clear, honest picture of their own progress. The Institute Management Portal brings that same transparency online — one place for students, teachers, and the Examination Board to stay in sync.';

// Sample figures — swap in the institute's real numbers whenever they're available.
export const STATS = [
  { label: 'Students', value: '500+' },
  { label: 'Teachers', value: '40+' },
  { label: 'Years of Excellence', value: '15+' },
  { label: 'Result Rate', value: '98%' },
];

export const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Student Progress',
    description: 'Track subject-wise performance and monthly progress with clear, visual reports.',
  },
  {
    icon: FileText,
    title: 'Monthly Results',
    description: 'View detailed monthly results with grades, percentages, and teacher remarks.',
  },
  {
    icon: CalendarDays,
    title: 'Timetable',
    description: 'Stay on schedule with an always up-to-date class timetable.',
  },
  {
    icon: ClipboardCheck,
    title: 'Examination System',
    description: 'A transparent workflow from paper scheduling through to final result publishing.',
  },
];

// Static sample content until Phase 7 adds real Announcement management and
// a public endpoint for reading published announcements — swap this array
// for an API call at that point; every component here just maps over it.
export const SAMPLE_ANNOUNCEMENTS = [
  {
    title: 'Mid-Term Examination Schedule Released',
    date: '2026-07-01',
    excerpt: 'Check the Paper Schedule page for exact dates, times, and rooms for all subjects.',
  },
  {
    title: 'Parent-Teacher Meeting — July 20th',
    date: '2026-06-24',
    excerpt: 'Monthly progress reports will be discussed. All parents are encouraged to attend.',
  },
  {
    title: 'New Computer Lab Inaugurated',
    date: '2026-06-15',
    excerpt: 'Grade 9 and 10 Computer Science classes now have access to 30 new workstations.',
  },
];

export const CONTACT = {
  address: '123 University Road, Karachi, Sindh, Pakistan',
  phone: '+92 21 1234 5678',
  email: 'info@institute.edu',
};

export const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'Twitter', href: '#', icon: Twitter },
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
];
