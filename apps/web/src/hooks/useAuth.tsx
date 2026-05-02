import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  logout: () => void;
}

interface User {
  id: string;
  githubId: string;
  email: string | null;
  role: string;
  orgId: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('devflow_token'));
  const [user, setUser] = useState<User | null>(null);

  const setToken = (t: string) => {
    localStorage.setItem('devflow_token', t);
    setTokenState(t);
  };

  const logout = () => {
    localStorage.removeItem('devflow_token');
    setTokenState(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) return;
    fetch('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data.data))
      .catch(() => logout());
  }, [token]);

  return <AuthContext.Provider value={{ token, user, setToken, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
