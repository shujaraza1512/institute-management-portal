import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../common/Logo.jsx';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Adds a shadow once the page has scrolled — the "sticky navigation"
  // the spec calls for, without anything flashier than that.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reads existing auth state (doesn't change AuthContext itself) so a
  // logged-in visitor sees "Go to Dashboard" instead of "Login".
  const ctaHref = user ? `/${user.role}/dashboard` : '/login';
  const ctaLabel = user ? 'Go to Dashboard' : 'Login';

  return (
    <header className={`sticky top-0 z-30 bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-card' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="min-w-0 focus:outline-none focus:ring-2 focus:ring-navy-500 rounded">
          <Logo size="sm" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('#') ? (
              <a key={link.label} href={link.href} className="text-sm text-ink hover:text-navy-700 transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.href} className="text-sm text-ink hover:text-navy-700 transition-colors">
                {link.label}
              </Link>
            )
          )}
          <Link to={ctaHref} className="btn-primary btn-sm">
            {ctaLabel}
          </Link>
        </nav>

        <button
          className="md:hidden text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-500 rounded"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-navy-100 bg-white px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('#') ? (
              <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block text-sm text-ink">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)} className="block text-sm text-ink">
                {link.label}
              </Link>
            )
          )}
          <Link to={ctaHref} onClick={() => setMobileOpen(false)} className="btn-primary btn-sm w-full">
            {ctaLabel}
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
