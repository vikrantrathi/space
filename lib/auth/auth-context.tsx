'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../../types/user';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  verifyOtp: (otp: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [isClientMounted, setIsClientMounted] = useState(false);

  // Handle client mounting first
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    if (!isClientMounted) return;
    
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token with API
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const user = await response.json();
            setAuthState({ user, isAuthenticated: true, isLoading: false });
          } else {
            localStorage.removeItem('token');
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };
    checkAuth();
  }, [isClientMounted]);

  const login = async (email: string, password: string) => {
    // Implement login logic with MFA check
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Check if this is a direct login (MFA disabled) or requires OTP
      if (data.token) {
        // Direct login - MFA is disabled
        localStorage.setItem('token', data.token);
        setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });

        // Redirect based on user role
        if (data.user.role === 'admin') {
          window.location.href = '/dashboard/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        // MFA is enabled - OTP was sent, continue to OTP verification step
        // The login page will handle showing the OTP form
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    // Implement signup logic with OTP
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Signup failed' }));
        throw new Error(errorData.error || errorData.message || 'Signup failed');
      }
      // Handle OTP step - signup was successful, OTP should be sent
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    if (isClientMounted) {
      localStorage.removeItem('token');
    }
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    // Show logout notification and redirect
    if (isClientMounted) {
      // Use setTimeout to ensure state update before redirect
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 100);
    }
  };

  const verifyOtp = async (otp: string) => {
    // Implement OTP verification
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'OTP verification failed' }));
        throw new Error(errorData.error || errorData.message || 'OTP verification failed');
      }
      const data = await response.json();

      // Check if this is a login verification (has token) or signup verification (no token)
      if (data.token) {
        // Login verification - user is approved and can log in
        localStorage.setItem('token', data.token);
        setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });

        // Redirect based on user role
        if (data.user.role === 'admin') {
          window.location.href = '/dashboard/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        // Signup verification - user created but needs approval
        // Don't authenticate, just return success message
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  const sendOtp = async (email: string) => {
    // Implement send OTP
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Send OTP failed' }));
        throw new Error(errorData.error || errorData.message || 'Send OTP failed');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        verifyOtp,
        sendOtp,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
