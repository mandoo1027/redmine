import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import NotificationBell from './NotificationBell';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItem = (to: string, label: string) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/');
    return (
      <Link
        to={to}
        className={`block rounded px-3 py-2 text-sm font-medium ${
          active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
        <Link to="/" className="text-lg font-bold text-blue-700">
          Redmine Clone
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <NotificationBell />
          <span className="text-gray-600">{user?.displayName || user?.username}</span>
          <button
            onClick={logout}
            className="rounded border px-3 py-1 text-gray-700 hover:bg-gray-100"
          >
            로그아웃
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-48 border-r bg-gray-50 p-3">
          <nav className="space-y-1">
            {navItem('/', '대시보드')}
            {navItem('/projects', '프로젝트')}
            {navItem('/issues', '이슈')}
            {user?.role === 'ADMIN' && navItem('/users', '사용자 관리')}
          </nav>
        </aside>
        <main className="flex-1 bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
