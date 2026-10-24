import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sc_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('sc_admin_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await adminApi.getMe();
      setUser(res.data.data);
      localStorage.setItem('sc_admin_user', JSON.stringify(res.data.data));
    } catch {
      localStorage.removeItem('sc_admin_token');
      localStorage.removeItem('sc_admin_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { verifyToken(); }, [verifyToken]);

  const login = async (email, password) => {
    const res = await adminApi.login({ email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('sc_admin_token', token);
    localStorage.setItem('sc_admin_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('sc_admin_token');
    localStorage.removeItem('sc_admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
