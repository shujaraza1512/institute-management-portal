import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/common/Logo.jsx';

/**
 * Shared shell for all three portals. Each role-specific layout (Student/
 * Teacher/Admin) passes in its own sidebar links and label; the sidebar,
 * top bar, and content frame stay identical across roles so the app feels
 * like one consistent product rather than three different UIs.
 */
function DashboardLayout({ sidebarItems, roleLabel, profilePath }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-colors ${
      isActive ? 'bg-green-500 text-navy-900 font-medium' : 'text-navy-100 hover:bg-navy-700 hover:text-white'
    }`;

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-navy-700">
        <Logo size="sm" light showName={false} className="mb-2" />
        <p className="font-display text-base tracking-wide text-white">Institute Portal</p>
        <p className="text-xs text-navy-200 mt-0.5">{roleLabel}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} className={navLinkClasses} onClick={() => setMobileNavOpen(false)}>
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="m-3 flex items-center gap-3 px-3 py-2 text-sm text-left rounded-card text-navy-100 hover:bg-navy-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Desktop sidebar */}
      <aside className="w-64 bg-navy-800 text-white flex-shrink-0 hidden md:flex md:flex-col print:hidden">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden print:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-64 bg-navy-800 text-white flex flex-col">
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 text-navy-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-navy-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="md:hidden text-navy-700 hover:text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            <p className="font-display text-navy-800 truncate">{roleLabel} Dashboard</p>
          </div>

          <Link
            to={profilePath}
            className="group flex items-center gap-2.5 rounded-card px-2 py-1.5 -mr-2 hover:bg-navy-50 transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500"
            title="Go to your profile"
          >
            <span className="text-sm text-muted hidden sm:inline group-hover:text-navy-800">{user?.name}</span>
            <span className="w-9 h-9 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center text-sm font-medium flex-shrink-0 group-hover:bg-navy-700 group-hover:text-white transition-colors">
              {initials}
            </span>
            <ChevronRight className="w-4 h-4 text-muted hidden sm:block group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
