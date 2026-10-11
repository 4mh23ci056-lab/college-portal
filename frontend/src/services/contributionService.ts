import { apiClient, apiRequest } from './api';
import { StorageEngine } from './storage';
import { Contribution } from '../types';

export const contributionService = {
  getContributionsByProject: async (projectId: string): Promise<Contribution[]> => {
    return apiRequest(
      () => apiClient.get<Contribution[]>(`/projects/${projectId}/contributions`),
      () => {
        const contributions = StorageEngine.getContributions();
        return contributions.filter((c) => c.projectId === projectId);
      }
    );
  },

  submitContribution: async (
    data: Omit<Contribution, 'id' | 'submissionDate' | 'guideReviewed' | 'guideRemarks'>
  ): Promise<Contribution> => {
    return apiRequest(
      () => apiClient.post<Contribution>(`/projects/${data.projectId}/contributions`, data),
      () => {
        const contributions = StorageEngine.getContributions();
        const newContrib: Contribution = {
          ...data,
          id: `contrib-${Date.now()}`,
          submissionDate: new Date().toISOString().split('T')[0],
          guideReviewed: false,
        };

        StorageEngine.setContributions([newContrib, ...contributions]);

        StorageEngine.addAuditLog({
          userId: data.studentId,
          userName: data.studentName,
          userRole: 'STUDENT',
          action: 'LOG_CONTRIBUTION',
          category: 'TASK',
          details: `Logged contribution for project work: "${data.description}"`,
          ipAddress: '127.0.0.1',
        });

        return newContrib;
      }
    );
  },

  reviewContribution: async (
    id: string,
    remarks: string
  ): Promise<Contribution> => {
    return apiRequest(
      () => apiClient.post<Contribution>(`/contributions/${id}/review`, { remarks }),
      () => {
        const contributions = StorageEngine.getContributions();
        const updated = contributions.map((c) =>
          c.id === id ? { ...c, guideReviewed: true, guideRemarks: remarks } : c
        );
        StorageEngine.setContributions(updated);
        return updated.find((c) => c.id === id)!;
      }
    );
  },
};
