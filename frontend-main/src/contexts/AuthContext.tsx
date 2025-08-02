import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'user';
  avatar?: string;
  createdAt: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'agent' | 'user';
    avatar?: string;
    created_at: string;
  };
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: 'user' | 'agent') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password }) as AuthResponse;
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        avatar: response.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: response.user.created_at,
      };
      
      setUser(userData);
      localStorage.setItem('quickdesk_token', response.token);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'user' | 'agent' = 'user'): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.register({ email, password, name, role }) as AuthResponse;
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        avatar: response.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: response.user.created_at,
      };
      
      setUser(userData);
      localStorage.setItem('quickdesk_token', response.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quickdesk_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};