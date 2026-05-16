import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { getStoredUser, logout as doLogout, getToken, isTokenValid } from '../services/authService';

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    if (!isTokenValid(token)) {
      doLogout();
      setUser(null);
      return;
    }

    setUser(getStoredUser());
  }, []);

  function logout() {
    doLogout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
