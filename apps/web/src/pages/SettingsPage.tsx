import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const infoRows = user
    ? [
        { label: 'GitHub ID', value: `#${user.githubId}` },
        { label: 'Email', value: user.email ?? '—' },
        { label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
        { label: 'Organization', value: user.orgId ?? '—' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>

        {/* Profile card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-900/40 to-gray-800 px-6 py-5 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white select-none">
                {user?.githubId?.slice(0, 1).toUpperCase() ?? '?'}
              </div>
              <div>
                <div className="text-white font-semibold text-lg">
                  {user?.email ?? `GitHub #${user?.githubId}`}
                </div>
                <div className="text-gray-400 text-sm capitalize">{user?.role}</div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-700">
            {infoRows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-6 py-4">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-gray-800 rounded-2xl border border-red-900/50 p-6">
          <h2 className="text-white font-semibold mb-1">Sign Out</h2>
          <p className="text-gray-400 text-sm mb-4">
            You will be redirected to the login page.
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
