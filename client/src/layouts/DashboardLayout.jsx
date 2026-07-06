import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Shared shell for all three portals. Each role-specific layout (Student/
 * Teacher/Admin) passes in its own sidebar links and label; the sidebar,
 * top bar, and content frame stay identical across roles so the app feels
 * like one consistent product rather than three different UIs.
 */
function DashboardLayout({ sidebarItems, roleLabel }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-64 bg-navy-800 text-white flex-shrink-0 hidden md:flex md:flex-col">
        <div className="px-6 py-5 border-b border-navy-700">
          <p className="font-display text-lg tracking-wide">Institute Portal</p>
          <p className="text-xs text-navy-200 mt-0.5">{roleLabel}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-3 py-2 rounded-card text-sm text-navy-100 hover:bg-navy-700 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-3 px-3 py-2 text-sm text-left rounded-card text-navy-100 hover:bg-navy-700 hover:text-white transition-colors"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-navy-100 flex items-center justify-between px-6 sticky top-0 z-10">
          <p className="font-display text-navy-800">{roleLabel} Dashboard</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:inline">{user?.name}</span>
            <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
