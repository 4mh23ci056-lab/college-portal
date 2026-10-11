import { apiClient, apiRequest } from './api';
import { StorageEngine } from './storage';
import { ProjectProposal, ProposalStatus } from '../types';

export const proposalService = {
  getProposalByProjectId: async (projectId: string): Promise<ProjectProposal | undefined> => {
    return apiRequest(
      () => apiClient.get<ProjectProposal>(`/projects/${projectId}/proposal`),
      () => {
        const proposals = StorageEngine.getProposals();
        return proposals.find((p) => p.projectId === projectId) || proposals[0];
      }
    );
  },

  saveProposalDraft: async (proposalData: Partial<ProjectProposal>): Promise<ProjectProposal> => {
    return apiRequest(
      () => apiClient.put<ProjectProposal>(`/proposals/${proposalData.id || 'draft'}`, proposalData),
      () => {
        const proposals = StorageEngine.getProposals();
        const existing = proposals.find((p) => p.projectId === proposalData.projectId) || proposals[0];

        const updated: ProjectProposal = {
          ...existing,
          ...proposalData,
          status: 'DRAFT' as ProposalStatus,
          updatedAt: new Date().toISOString(),
        };

        const list = proposals.map((p) => (p.id === updated.id ? updated : p));
        StorageEngine.setProposals(list);
        return updated;
      }
    );
  },

  submitProposal: async (proposalData: ProjectProposal): Promise<ProjectProposal> => {
    return apiRequest(
      () => apiClient.post<ProjectProposal>(`/proposals/${proposalData.id}/submit`, proposalData),
      () => {
        const proposals = StorageEngine.getProposals();
        const existing = proposals.find((p) => p.id === proposalData.id) || proposals[0];

        const isRevision = existing.status === 'MODIFICATION_REQUESTED';
        const newVersion = isRevision ? existing.version + 1 : existing.version;

        const updated: ProjectProposal = {
          ...existing,
          ...proposalData,
          status: 'PENDING_REVIEW',
          version: newVersion,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            {
              id: `hist-${Date.now()}`,
              timestamp: new Date().toISOString(),
              version: newVersion,
              authorName: 'Sinchana Rao (Student Lead)',
              action: isRevision ? 'Revised Proposal Resubmitted' : 'Proposal Submitted for Review',
              notes: isRevision ? 'Addressed guide requested modifications' : 'First official proposal submission',
            },
            ...existing.history,
          ],
        };

        StorageEngine.setProposals(proposals.map((p) => (p.id === updated.id ? updated : p)));

        StorageEngine.addAuditLog({
          userId: 'user-student-1',
          userName: 'Sinchana Rao',
          userRole: 'STUDENT',
          action: isRevision ? 'RESUBMIT_PROPOSAL' : 'SUBMIT_PROPOSAL',
          category: 'PROPOSAL',
          details: `Submitted proposal version ${newVersion} for review`,
          ipAddress: '127.0.0.1',
        });

        return updated;
      }
    );
  },

  guideReviewProposal: async (
    proposalId: string,
    status: 'APPROVED' | 'MODIFICATION_REQUESTED' | 'REJECTED',
    guideComment: string,
    guideName: string
  ): Promise<ProjectProposal> => {
    return apiRequest(
      () => apiClient.post<ProjectProposal>(`/proposals/${proposalId}/review`, { status, guideComment }),
      () => {
        const proposals = StorageEngine.getProposals();
        const existing = proposals.find((p) => p.id === proposalId) || proposals[0];

        const newComment = {
          id: `com-${Date.now()}`,
          authorId: 'user-guide-1',
          authorName: guideName,
          authorRole: 'GUIDE' as const,
          comment: guideComment,
          timestamp: new Date().toISOString(),
        };

        const updated: ProjectProposal = {
          ...existing,
          status,
          updatedAt: new Date().toISOString(),
          guideComments: [newComment, ...existing.guideComments],
          history: [
            {
              id: `hist-${Date.now()}`,
              timestamp: new Date().toISOString(),
              version: existing.version,
              authorName: guideName,
              action: status === 'APPROVED' ? 'Proposal Approved' : status === 'MODIFICATION_REQUESTED' ? 'Modification Requested' : 'Proposal Rejected',
              notes: guideComment,
            },
            ...existing.history,
          ],
        };

        StorageEngine.setProposals(proposals.map((p) => (p.id === updated.id ? updated : p)));

        StorageEngine.addAuditLog({
          userId: 'user-guide-1',
          userName: guideName,
          userRole: 'GUIDE',
          action: `PROPOSAL_${status}`,
          category: 'PROPOSAL',
          details: `Guide reviewed proposal #${proposalId}: status set to ${status}`,
          ipAddress: '127.0.0.1',
        });

        return updated;
      }
    );
  },
};
