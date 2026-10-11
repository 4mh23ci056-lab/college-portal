import { apiClient, apiRequest } from './api';
import { StorageEngine } from './storage';
import { User, Project, AuditLog, SystemStats, Role } from '../types';

export const adminService = {
  getUsers: async (): Promise<User[]> => {
    return apiRequest(
      () => apiClient.get<User[]>('/admin/users'),
      () => StorageEngine.getUsers()
    );
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    return apiRequest(
      () => apiClient.post<User>('/admin/users', userData),
      () => {
        const users = StorageEngine.getUsers();
        const newUser: User = {
          ...userData,
          id: `user-${userData.role.toLowerCase()}-${Date.now()}`,
        };
        StorageEngine.setUsers([...users, newUser]);

        StorageEngine.addAuditLog({
          userId: 'user-admin-1',
          userName: 'Prof. Ananya Sen',
          userRole: 'ADMIN',
          action: 'CREATE_USER',
          category: 'SECURITY',
          details: `Created new ${userData.role} user: ${userData.name} (${userData.email})`,
          ipAddress: '127.0.0.1',
        });

        return newUser;
      }
    );
  },

  updateUserRole: async (userId: string, role: Role): Promise<User> => {
    return apiRequest(
      () => apiClient.patch<User>(`/admin/users/${userId}/role`, { role }),
      () => {
        const users = StorageEngine.getUsers();
        const updated = users.map((u) => (u.id === userId ? { ...u, role } : u));
        StorageEngine.setUsers(updated);

        StorageEngine.addAuditLog({
          userId: 'user-admin-1',
          userName: 'Prof. Ananya Sen',
          userRole: 'ADMIN',
          action: 'UPDATE_USER_ROLE',
          category: 'SECURITY',
          details: `Updated user #${userId} role to ${role}`,
          ipAddress: '127.0.0.1',
        });

        return updated.find((u) => u.id === userId)!;
      }
    );
  },

  assignGuideToProject: async (projectId: string, guideId: string): Promise<Project> => {
    return apiRequest(
      () => apiClient.patch<Project>(`/admin/projects/${projectId}/assign-guide`, { guideId }),
      () => {
        const users = StorageEngine.getUsers();
        const guide = users.find((u) => u.id === guideId);
        const projects = StorageEngine.getProjects();
        const updated = projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              guideId,
              guideName: guide ? guide.name : p.guideName,
            };
          }
          return p;
        });

        StorageEngine.setProjects(updated);

        StorageEngine.addAuditLog({
          userId: 'user-admin-1',
          userName: 'Prof. Ananya Sen',
          userRole: 'ADMIN',
          action: 'ALLOCATE_GUIDE',
          category: 'SYSTEM',
          details: `Assigned guide ${guide?.name || guideId} to project #${projectId}`,
          ipAddress: '127.0.0.1',
        });

        return updated.find((p) => p.id === projectId)!;
      }
    );
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    return apiRequest(
      () => apiClient.get<AuditLog[]>('/admin/audit-logs'),
      () => StorageEngine.getAuditLogs()
    );
  },

  getSystemStats: async (): Promise<SystemStats> => {
    return apiRequest(
      () => apiClient.get<SystemStats>('/admin/statistics'),
      () => {
        const users = StorageEngine.getUsers();
        const projects = StorageEngine.getProjects();
        const proposals = StorageEngine.getProposals();
        const evals = StorageEngine.getEvaluations();

        const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
        const totalGuides = users.filter((u) => u.role === 'GUIDE').length;
        const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
        const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
        const pendingProposals = proposals.filter((p) => p.status === 'PENDING_REVIEW').length;
        const avgProg = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progressPercentage, 0) / projects.length) : 0;

        return {
          totalStudents,
          totalGuides,
          totalAdmins,
          totalProjects: projects.length,
          completedProjects,
          pendingProposals,
          pendingEvaluations: evals.length,
          averageProgress: avgProg,
        };
      }
    );
  },
};
