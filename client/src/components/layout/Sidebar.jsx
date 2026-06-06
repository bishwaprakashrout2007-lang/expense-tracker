import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard,
  MdAttachMoney,
  MdMoneyOff,
  MdOutlineAnalytics,
  MdListAlt,
  MdAccountCircle,
  MdLogout,
  MdTrendingUp,
} from 'react-icons/md';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard className="w-5 h-5" /> },
    { name: 'Income', path: '/income', icon: <MdAttachMoney className="w-5 h-5" /> },
    { name: 'Expenses', path: '/expenses', icon: <MdMoneyOff className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <MdOutlineAnalytics className="w-5 h-5" /> },
    { name: 'Budget Planning', path: '/budget', icon: <MdTrendingUp className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <MdListAlt className="w-5 h-5" /> },
    { name: 'User Profile', path: '/profile', icon: <MdAccountCircle className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/25 dark:bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-45 flex flex-col w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/80 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-slate-800/50">
          <div className="p-2 bg-gradient-brand rounded-xl text-white shadow-md shadow-brand-500/20">
            <MdAttachMoney className="w-6 h-6 rotate-12" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
              Finance<span className="text-brand-600 dark:text-brand-400">Flow</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/15 dark:shadow-brand-500/5'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-850 dark:hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/55 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="avatar"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/10"
                />
              ) : (
                <div className="w-10 h-10 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-450 font-bold">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="overflow-hidden w-28">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-250 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <MdLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
