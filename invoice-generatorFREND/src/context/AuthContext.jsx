/* eslint-disable react-refresh/only-export-components */
import  { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('jwtToken') || null;
  });

  const [loading, setLoading] = useState(false);

  // Synchronize state changes with localStorage
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
    } else {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userData');
    }
  }, [token, user]);

  /**
   * Helper function to store response auth payload
   */
  const handleAuthSuccess = (response) => {
    const { token: jwtToken, username, email, roles } = response;
    const userData = { username, email, roles };
    
    setToken(jwtToken);
    setUser(userData);
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
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
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