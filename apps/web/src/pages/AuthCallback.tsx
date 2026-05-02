import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setToken(token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400 text-lg animate-pulse">Authenticating…</div>
    </div>
  );
}
