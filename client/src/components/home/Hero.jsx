import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { INSTITUTE_NAME, INSTITUTE_TAGLINE } from '../../constants/siteContent.js';

function Hero() {
  const { user } = useAuth();
  const ctaHref = user ? `/${user.role}/dashboard` : '/login';
  const ctaLabel = user ? 'Go to Dashboard' : 'Login to Portal';

  return (
    <section className="bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-medium text-sky-500 tracking-wide uppercase">Welcome to</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-display text-navy-800 leading-tight">{INSTITUTE_NAME}</h1>
          <p className="mt-4 text-muted max-w-md">{INSTITUTE_TAGLINE}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={ctaHref} className="btn-primary">
              {ctaLabel}
            </Link>
            <a href="#features" className="px-6 py-3 text-navy-700 border border-navy-200 rounded-card hover:border-navy-400 transition-colors">
              Explore Features
            </a>
          </div>
        </div>

        {/* Decorative preview panel echoing the real dashboard cards, rather
            than a stock photo — keeps the hero on-brand and copyright-safe. */}
        <div className="relative hidden md:block">
          <div className="absolute -inset-6 bg-navy-100 rounded-card rotate-2" aria-hidden="true" />
          <div className="relative bg-white rounded-card shadow-card p-6 space-y-4">
            <p className="font-display text-navy-800">Student Snapshot</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-card p-3">
                <p className="text-xs text-muted">Attendance</p>
                <p className="text-lg font-display text-navy-800">96%</p>
              </div>
              <div className="bg-surface rounded-card p-3">
                <p className="text-xs text-muted">Latest Grade</p>
                <p className="text-lg font-display text-approve">A</p>
              </div>
              <div className="bg-surface rounded-card p-3">
                <p className="text-xs text-muted">Subjects</p>
                <p className="text-lg font-display text-navy-800">8</p>
              </div>
              <div className="bg-surface rounded-card p-3">
                <p className="text-xs text-muted">Next Exam</p>
                <p className="text-lg font-display text-navy-800">12 Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
