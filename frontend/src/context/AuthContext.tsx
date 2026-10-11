import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/authService';
import { StorageEngine } from '../services/storage';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore existing session
    const storedToken = localStorage.getItem('protrack_token');
    const storedUser = authService.getCurrentUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      // Default to student user for seamless preview
      const defaultUser = StorageEngine.getUsers().find((u) => u.role === 'STUDENT') || null;
      if (defaultUser) {
        const mockToken = `session-${defaultUser.id}`;
        localStorage.setItem('protrack_token', mockToken);
        localStorage.setItem('protrack_user', JSON.stringify(defaultUser));
        setToken(mockToken);
        setUser(defaultUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login(identifier, password);
      setUser(response.user);
      setToken(response.token);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const switchRole = (newRole: Role) => {
    const allUsers = StorageEngine.getUsers();
    const targetUser = allUsers.find((u) => u.role === newRole) || allUsers[0];
    const newToken = `token-${targetUser.id}-${Date.now()}`;
    localStorage.setItem('protrack_token', newToken);
    localStorage.setItem('protrack_user', JSON.stringify(targetUser));
    setUser(targetUser);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
