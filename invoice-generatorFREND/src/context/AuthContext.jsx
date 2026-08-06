/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState,  } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('jwtToken') || null;
  });

  const [loading, setLoading] = useState(false);

  // Helper to synchronously update state and sessionStorage simultaneously
  const saveAuthData = (jwtToken, userData) => {
    if (jwtToken && userData) {
      sessionStorage.setItem('jwtToken', jwtToken);
      sessionStorage.setItem('userData', JSON.stringify(userData));
    } else {
      sessionStorage.removeItem('jwtToken');
      sessionStorage.removeItem('userData');
    }
    setToken(jwtToken);
    setUser(userData);
  };

  /**
   * Helper function to store response auth payload
   */
  const handleAuthSuccess = (response) => {
    const { token: jwtToken, username, email, roles } = response;
    const userData = { username, email, roles };

    // Synchronously save to sessionStorage BEFORE React state / navigation triggers
    saveAuthData(jwtToken, userData);
    return response;
  };

  /**
   * User login action
   */
  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      return handleAuthSuccess(data);
    } finally {
      setLoading(false);
    }
  };

  /**
   * User registration action
   */
  const register = async (credentials) => {
    setLoading(true);
    try {
      const data = await authApi.register(credentials);
      return handleAuthSuccess(data);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and clear tokens
   */
  const logout = () => {
    saveAuthData(null, null);
  };

  /**
   * Check if current authenticated user possesses a given role
   * @param {string} roleName - e.g., 'ROLE_ADMIN' or 'ROLE_USER'
   */
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};