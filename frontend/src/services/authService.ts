import { apiClient, apiRequest } from './api';
import { StorageEngine } from './storage';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (identifier: string, _password: string): Promise<LoginResponse> => {
    return apiRequest(
      () => apiClient.post<LoginResponse>('/auth/login', { identifier, password: _password }),
      () => {
        const users = StorageEngine.getUsers();
        const trimmed = identifier.trim().toLowerCase();
        const found = users.find(
          (u) =>
            u.email.toLowerCase() === trimmed ||
            u.username.toLowerCase() === trimmed ||
            u.enrollmentNumber?.toLowerCase() === trimmed
        ) || users[0]; // fallback to first user if matching student

        const token = `mock-jwt-token-${found.id}-${Date.now()}`;
        localStorage.setItem('protrack_token', token);
        localStorage.setItem('protrack_user', JSON.stringify(found));

        StorageEngine.addAuditLog({
          userId: found.id,
          userName: found.name,
          userRole: found.role,
          action: 'USER_LOGIN',
          category: 'AUTH',
          details: `User logged into portal with role ${found.role}`,
          ipAddress: '127.0.0.1',
        });

        return { token, user: found };
      }
    );
  },

  getCurrentUser: (): User | null => {
    const raw = localStorage.getItem('protrack_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    const user = authService.getCurrentUser();
    if (user) {
      StorageEngine.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGOUT',
        category: 'AUTH',
        details: 'User logged out of session',
        ipAddress: '127.0.0.1',
      });
    }
    localStorage.removeItem('protrack_token');
    localStorage.removeItem('protrack_user');
  },
};
