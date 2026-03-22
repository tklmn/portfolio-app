import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineCollection,
  HiOutlineLightningBolt,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineLogout,
  HiMenu,
  HiX,
} from 'react-icons/hi';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: HiOutlineHome },
  { name: 'About', href: '/admin/about', icon: HiOutlineDocumentText },
  { name: 'Projects', href: '/admin/projects', icon: HiOutlineCollection },
  { name: 'Skills', href: '/admin/skills', icon: HiOutlineLightningBolt },
  { name: 'Messages', href: '/admin/messages', icon: HiOutlineMail },
  { name: 'Blog Posts', href: '/admin/posts', icon: HiOutlineDocumentText },
  { name: 'GitHub Import', href: '/admin/github', icon: HiOutlineCollection },
  { name: 'Settings', href: '/admin/settings', icon: HiOutlineHome },
  { name: 'Trash', href: '/admin/trash', icon: HiOutlineTrash },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-700 dark:text-gray-300"
      >
        {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <Link to="/admin" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </Link>
            {user && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <Link
              to="/admin/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Profile &amp; Password
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              View Site &rarr;
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 w-full transition-colors"
            >
              <HiOutlineLogout size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
