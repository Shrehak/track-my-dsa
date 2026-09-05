import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserStats: (stats: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to restore session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const handleAuthSuccess = (res: { user: User; token: string }) => {
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    handleAuthSuccess(res);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    handleAuthSuccess(res);
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    handleAuthSuccess(res);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserStats = (stats: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...stats });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        updateUserStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
