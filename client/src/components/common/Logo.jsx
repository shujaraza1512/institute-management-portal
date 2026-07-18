import { GraduationCap } from 'lucide-react';
import { INSTITUTE_NAME } from '../../constants/siteContent.js';

// Placeholder institute mark -- built entirely from the brand palette
// (no real logo file was provided). Swapping in a real logo image later
// is a one-line change: replace the <span> mark below with an <img
// src="/logo.svg" /> of the same size classes, and the name text can stay
// or be dropped depending on the real logo's design.
const SIZES = {
  sm: { mark: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
  md: { mark: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-lg' },
  lg: { mark: 'w-14 h-14', icon: 'w-7 h-7', text: 'text-2xl' },
};

function Logo({ size = 'md', showName = true, light = false, className = '' }) {
  const s = SIZES[size] || SIZES.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`${s.mark} rounded-card bg-navy-700 flex items-center justify-center flex-shrink-0 ring-2 ring-green-500/40`}
        aria-hidden="true"
      >
        <GraduationCap className={`${s.icon} text-white`} />
      </span>
      {showName && (
        <span className={`font-display ${s.text} ${light ? 'text-white' : 'text-navy-800'} truncate`}>
          {INSTITUTE_NAME}
        </span>
      )}
    </div>
  );
}

export default Logo;
