import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-white font-bold text-lg">
            DevFlow <span className="text-blue-400">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
            Dashboard
          </Link>
          <Link to="/docs" className="text-gray-300 hover:text-white text-sm transition-colors">
            Docs Generator
          </Link>
        </div>

        {/* User */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-white font-medium">{user.email ?? `#${user.githubId}`}</div>
              <div className="text-xs text-gray-400 capitalize">{user.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
