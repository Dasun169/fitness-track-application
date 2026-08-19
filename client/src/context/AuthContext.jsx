import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gym_tracker_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('gym_tracker_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Verify token validity on load
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/users/profile');
          setUser(response.data);
          localStorage.setItem('gym_tracker_user', JSON.stringify(response.data));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token: jwtToken, user: userData } = response.data;

      setToken(jwtToken);
      setUser(userData);

      localStorage.setItem('gym_tracker_token', jwtToken);
      localStorage.setItem('gym_tracker_user', JSON.stringify(userData));

      return userData;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gym_tracker_token');
    localStorage.removeItem('gym_tracker_user');
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        logout,
        changePassword,
        clearError,
        isAuthenticated: !!token && !!user,
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
