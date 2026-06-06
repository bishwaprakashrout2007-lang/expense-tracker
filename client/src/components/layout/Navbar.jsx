import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MdMenu, MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  // Determine greeting based on current local time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-20 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/40">
      {/* Left side: Menu trigger & Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
        >
          <MdMenu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100">
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'User'}!
          </h1>
          <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 font-medium">
            Here's a breakdown of your personal finances today.
          </p>
        </div>
      </div>

      {/* Right side: Dark Mode Toggle & Quick Info */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <MdOutlineLightMode className="w-5 h-5" />
          ) : (
            <MdOutlineDarkMode className="w-5 h-5" />
          )}
        </button>

        {/* Small Profile Info */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/10"
            />
          ) : (
            <div className="w-9 h-9 bg-brand-500/15 dark:bg-brand-550/20 rounded-xl flex items-center justify-center text-brand-650 dark:text-brand-400 font-bold text-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
