import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('projectpulse_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('projectpulse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      if (token) {
        try {
          const { data } = await authService.getMe();
          if (data.success) {
            setUser(data.data);
            localStorage.setItem('projectpulse_user', JSON.stringify(data.data));
          }
        } catch (error) {
          console.error('Session validation error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedInUser();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    if (data.success) {
      setUser(data.data);
      setToken(data.data.token);
      localStorage.setItem('projectpulse_token', data.data.token);
      localStorage.setItem('projectpulse_user', JSON.stringify(data.data));
      return data;
    }
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    if (data.success) {
      setUser(data.data);
      setToken(data.data.token);
      localStorage.setItem('projectpulse_token', data.data.token);
      localStorage.setItem('projectpulse_user', JSON.stringify(data.data));
      return data;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('projectpulse_token');
    localStorage.removeItem('projectpulse_user');
    localStorage.removeItem('projectpulse_active_org');
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('projectpulse_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserData,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
