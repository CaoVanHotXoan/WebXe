import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserProfile = {
  id?: number;
  roleId?: number;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginUser: (token: string, user: UserProfile) => void;
  logoutUser: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loginUser: () => {},
  logoutUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedProfile = localStorage.getItem('profile');
      if (storedToken && storedProfile) {
        setToken(storedToken);
        setUser(JSON.parse(storedProfile));
      }
    } catch (e) {
      console.error('Error rehydrating auth state:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const loginUser = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth', 'true');
    localStorage.setItem('token', newToken);
    localStorage.setItem('profile', JSON.stringify(newUser));
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user?.roleId === 1 || user?.username === 'admin');

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
