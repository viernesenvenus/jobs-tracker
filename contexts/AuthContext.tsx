'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, OnboardingData } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: (data: OnboardingData) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In a real app, validate token with backend
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        onboardingCompleted: true,
        preferences: {
          notifications: true,
          language: 'es',
          priorityFeatures: ['organization', 'cv_adaptation'],
          activeProcesses: 2
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setUser(mockUser);
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        email,
        name,
        onboardingCompleted: false,
        preferences: {
          notifications: true,
          language: 'es',
          priorityFeatures: [],
          activeProcesses: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setUser(mockUser);
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const completeOnboarding = async (data: OnboardingData): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const updatedUser: User = {
        ...user,
        role: data.desiredRole,
        onboardingCompleted: true,
        preferences: {
          ...user.preferences,
          priorityFeatures: data.priorityFeatures,
          activeProcesses: data.activeProcesses === 'none' ? 0 : data.activeProcesses === '1-2' ? 1 : 3
        },
        updatedAt: new Date()
      };

      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Onboarding completion failed:', error);
      return false;
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('User update failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      completeOnboarding,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
