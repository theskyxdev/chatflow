import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';

function MainLayout({ children, user, onThemeToggle, theme, onMenuClick }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleTheme = () => {
    toggleTheme();
    onThemeToggle?.();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 z-10">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-primary-600">ChatFlow</h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={handleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-1.414-1.414 1.414-1.415 1.414 1.414.707-.707-2.121-2.121.707-.707 2.121 2.12zm2.828-2.828l1.414 1.414-1.414 1.415-1.414-1.414-.707.707 2.121 2.121-.707.707-2.121-2.12zM10 18a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zM5.05 12.464l-1.414 1.414-1.415-1.414-1.414 1.414.707.707 2.121-2.121.707.707-2.12 2.121z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <img
                src={user?.avatarUrl || 'https://via.placeholder.com/32'}
                alt={user?.name}
                className="w-8 h-8 rounded-full cursor-pointer object-cover"
                onClick={() => navigate('/profile')}
                title="Go to profile"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
              </div>
            </div>

            {/* Menu dropdown */}
            <div className="relative group">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 hidden group-hover:block z-50">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-t-lg"
                >
                  View profile
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-b-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 pt-16 px-4 py-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
