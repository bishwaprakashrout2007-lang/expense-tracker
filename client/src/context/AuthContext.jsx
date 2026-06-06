import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on startup
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register User
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          profilePicture: res.data.profilePicture,
        });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  // Login User
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          profilePicture: res.data.profilePicture,
        });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          profilePicture: res.data.profilePicture,
        });
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
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
