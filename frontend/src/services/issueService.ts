import { apiClient, apiRequest } from './api';
import { StorageEngine } from './storage';
import { ProjectIssue, IssueStatus } from '../types';

export const issueService = {
  getIssuesByProject: async (projectId: string): Promise<ProjectIssue[]> => {
    return apiRequest(
      () => apiClient.get<ProjectIssue[]>(`/projects/${projectId}/issues`),
      () => {
        const issues = StorageEngine.getIssues();
        return issues.filter((i) => i.projectId === projectId);
      }
    );
  },

  getAllIssues: async (): Promise<ProjectIssue[]> => {
    return apiRequest(
      () => apiClient.get<ProjectIssue[]>('/issues'),
      () => StorageEngine.getIssues()
    );
  },

  reportIssue: async (
    data: Omit<ProjectIssue, 'id' | 'reportedAt' | 'status'>
  ): Promise<ProjectIssue> => {
    return apiRequest(
      () => apiClient.post<ProjectIssue>(`/projects/${data.projectId}/issues`, data),
      () => {
        const issues = StorageEngine.getIssues();
        const newIssue: ProjectIssue = {
          ...data,
          id: `iss-${Date.now()}`,
          reportedAt: new Date().toISOString().split('T')[0],
          status: 'REPORTED',
        };

        StorageEngine.setIssues([newIssue, ...issues]);

        StorageEngine.addAuditLog({
          userId: data.reportedById,
          userName: data.reportedByName,
          userRole: 'STUDENT',
          action: 'REPORT_ISSUE',
          category: 'TASK',
          details: `Reported issue: "${data.title}"`,
          ipAddress: '127.0.0.1',
        });

        return newIssue;
      }
    );
  },

  submitResolution: async (
    issueId: string,
    resolution: {
      identifiedCause: string;
      correctiveAction: string;
      resolutionSummary: string;
      learningNote: string;
    }
  ): Promise<ProjectIssue> => {
    return apiRequest(
      () => apiClient.post<ProjectIssue>(`/issues/${issueId}/resolution`, resolution),
      () => {
        const issues = StorageEngine.getIssues();
        const updated = issues.map((i) => {
          if (i.id === issueId) {
            return {
              ...i,
              ...resolution,
              status: 'RESOLUTION_SUBMITTED' as IssueStatus,
            };
          }
          return i;
        });

        StorageEngine.setIssues(updated);
        return updated.find((i) => i.id === issueId)!;
      }
    );
  },

  guideVerifyIssue: async (
    issueId: string,
    decision: {
      status: 'GUIDE_VERIFIED' | 'CLOSED' | 'UNDER_REVIEW';
      guideRemarks: string;
    }
  ): Promise<ProjectIssue> => {
    return apiRequest(
      () => apiClient.post<ProjectIssue>(`/issues/${issueId}/verify`, decision),
      () => {
        const issues = StorageEngine.getIssues();
        const updated = issues.map((i) => {
          if (i.id === issueId) {
            return {
              ...i,
              status: decision.status as IssueStatus,
              guideVerificationRemarks: decision.guideRemarks,
              verifiedAt: new Date().toISOString().split('T')[0],
            };
          }
          return i;
        });

        StorageEngine.setIssues(updated);

        StorageEngine.addAuditLog({
          userId: 'user-guide-1',
          userName: 'Dr. Ramesh Kulkarni',
          userRole: 'GUIDE',
          action: 'VERIFY_ISSUE',
          category: 'TASK',
          details: `Guide verified resolution for issue #${issueId}: status is ${decision.status}`,
          ipAddress: '127.0.0.1',
        });

        return updated.find((i) => i.id === issueId)!;
      }
    );
  },
};
