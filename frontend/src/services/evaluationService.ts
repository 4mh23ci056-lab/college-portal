import { apiClient, apiRequest } from './api';
import { StorageEngine } from './storage';
import {
  EvaluationRecord,
  FeedbackResolutionItem,
  FeedbackStatus,
  ScoreTrend,
} from '../types';

export const evaluationService = {
  getEvaluationsByProject: async (projectId: string): Promise<EvaluationRecord[]> => {
    return apiRequest(
      () => apiClient.get<EvaluationRecord[]>(`/projects/${projectId}/evaluations`),
      () => {
        const evals = StorageEngine.getEvaluations();
        return evals.filter((e) => e.projectId === projectId);
      }
    );
  },

  recordEvaluation: async (
    data: Omit<EvaluationRecord, 'id' | 'trend'>
  ): Promise<EvaluationRecord> => {
    return apiRequest(
      () => apiClient.post<EvaluationRecord>(`/projects/${data.projectId}/evaluations`, data),
      () => {
        const evals = StorageEngine.getEvaluations();
        const projectEvals = evals.filter((e) => e.projectId === data.projectId);
        const prevEval = projectEvals[projectEvals.length - 1];

        let trend: ScoreTrend = 'UNCHANGED';
        if (prevEval) {
          if (data.totalScore > prevEval.totalScore) trend = 'IMPROVING';
          else if (data.totalScore < prevEval.totalScore) trend = 'DECLINING';
        }

        const newEval: EvaluationRecord = {
          ...data,
          id: `eval-round-${Date.now()}`,
          trend,
        };

        StorageEngine.setEvaluations([...evals, newEval]);

        // Automatically populate feedback items if required actions exist
        if (data.requiredActions && data.requiredActions.length > 0) {
          const feedbackList = StorageEngine.getFeedbackItems();
          const newItems: FeedbackResolutionItem[] = data.requiredActions.map((action, idx) => ({
            id: `fres-${Date.now()}-${idx}`,
            projectId: data.projectId,
            evaluationId: newEval.id,
            feedbackReceived: data.generalFeedback || 'Guide evaluation review feedback',
            requiredAction: action,
            status: 'PENDING_ACTION',
            updatedAt: new Date().toISOString(),
          }));
          StorageEngine.setFeedbackItems([...newItems, ...feedbackList]);
        }

        StorageEngine.addAuditLog({
          userId: data.reviewerId,
          userName: data.reviewerName,
          userRole: 'GUIDE',
          action: 'RECORD_EVALUATION',
          category: 'EVALUATION',
          details: `Recorded review "${data.reviewRoundName}" with total score ${data.totalScore}/${data.maxTotalScore}`,
          ipAddress: '127.0.0.1',
        });

        return newEval;
      }
    );
  },

  getFeedbackItemsByProject: async (projectId: string): Promise<FeedbackResolutionItem[]> => {
    return apiRequest(
      () => apiClient.get<FeedbackResolutionItem[]>(`/projects/${projectId}/feedback`),
      () => {
        const items = StorageEngine.getFeedbackItems();
        return items.filter((f) => f.projectId === projectId);
      }
    );
  },

  submitStudentCorrection: async (
    feedbackId: string,
    correction: {
      studentCorrection: string;
      evidenceSubmissionName: string;
    }
  ): Promise<FeedbackResolutionItem> => {
    return apiRequest(
      () => apiClient.post<FeedbackResolutionItem>(`/feedback/${feedbackId}/correction`, correction),
      () => {
        const items = StorageEngine.getFeedbackItems();
        const updated = items.map((f) => {
          if (f.id === feedbackId) {
            return {
              ...f,
              ...correction,
              submittedAt: new Date().toISOString(),
              status: 'STUDENT_SUBMITTED' as FeedbackStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return f;
        });

        StorageEngine.setFeedbackItems(updated);

        StorageEngine.addAuditLog({
          userId: 'user-student-1',
          userName: 'Sinchana Rao',
          userRole: 'STUDENT',
          action: 'FEEDBACK_CORRECTION_SUBMITTED',
          category: 'EVALUATION',
          details: `Submitted correction for action "${correction.studentCorrection.slice(0, 40)}..."`,
          ipAddress: '127.0.0.1',
        });

        return updated.find((f) => f.id === feedbackId)!;
      }
    );
  },

  guideVerifyFeedback: async (
    feedbackId: string,
    decision: {
      status: 'GUIDE_VERIFIED' | 'FURTHER_CORRECTION_REQUIRED';
      guideVerificationNote: string;
    }
  ): Promise<FeedbackResolutionItem> => {
    return apiRequest(
      () => apiClient.post<FeedbackResolutionItem>(`/feedback/${feedbackId}/verify`, decision),
      () => {
        const items = StorageEngine.getFeedbackItems();
        const updated = items.map((f) => {
          if (f.id === feedbackId) {
            return {
              ...f,
              status: decision.status as FeedbackStatus,
              guideVerificationNote: decision.guideVerificationNote,
              updatedAt: new Date().toISOString(),
            };
          }
          return f;
        });

        StorageEngine.setFeedbackItems(updated);

        StorageEngine.addAuditLog({
          userId: 'user-guide-1',
          userName: 'Dr. Ramesh Kulkarni',
          userRole: 'GUIDE',
          action: 'VERIFY_FEEDBACK_CORRECTION',
          category: 'EVALUATION',
          details: `Guide marked feedback item #${feedbackId} as ${decision.status}`,
          ipAddress: '127.0.0.1',
        });

        return updated.find((f) => f.id === feedbackId)!;
      }
    );
  },
};
