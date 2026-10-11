import { apiClient, apiRequest } from './api';
import { StorageEngine } from './storage';
import { Task, DeliverableEvidence, TaskStatus, TaskImportance, Project } from '../types';

export const taskService = {
  getTasksByProject: async (projectId: string): Promise<Task[]> => {
    return apiRequest(
      () => apiClient.get<Task[]>(`/projects/${projectId}/tasks`),
      () => {
        const tasks = StorageEngine.getTasks();
        const now = new Date().toISOString().split('T')[0];
        return tasks
          .filter((t) => t.projectId === projectId)
          .map((t) => ({
            ...t,
            isOverdue: t.status !== 'COMPLETED' && t.proposedDeadline < now,
          }));
      }
    );
  },

  createTask: async (taskData: Omit<Task, 'id' | 'evidence' | 'progressPercentage'>): Promise<Task> => {
    return apiRequest(
      () => apiClient.post<Task>(`/projects/${taskData.projectId}/tasks`, taskData),
      () => {
        const tasks = StorageEngine.getTasks();
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          progressPercentage: taskData.status === 'COMPLETED' ? 100 : taskData.status === 'IN_PROGRESS' ? 50 : 0,
          evidence: [],
        };
        const updated = [...tasks, newTask];
        StorageEngine.setTasks(updated);

        // Recalculate project progress
        taskService.syncProjectProgress(taskData.projectId, updated);

        StorageEngine.addAuditLog({
          userId: taskData.assignedToId,
          userName: taskData.assignedToName,
          userRole: 'STUDENT',
          action: 'CREATE_TASK',
          category: 'TASK',
          details: `Created new project task: "${newTask.title}"`,
          ipAddress: '127.0.0.1',
        });

        return newTask;
      }
    );
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    return apiRequest(
      () => apiClient.put<Task>(`/tasks/${taskId}`, updates),
      () => {
        const tasks = StorageEngine.getTasks();
        const updated = tasks.map((t) => {
          if (t.id === taskId) {
            const newStatus = (updates.status || t.status) as TaskStatus;
            const progress =
              updates.progressPercentage !== undefined
                ? updates.progressPercentage
                : newStatus === 'COMPLETED'
                ? 100
                : newStatus === 'NOT_STARTED'
                ? 0
                : t.progressPercentage;

            return {
              ...t,
              ...updates,
              status: newStatus,
              progressPercentage: progress,
            };
          }
          return t;
        });

        StorageEngine.setTasks(updated);
        const changed = updated.find((t) => t.id === taskId)!;
        taskService.syncProjectProgress(changed.projectId, updated);

        return changed;
      }
    );
  },

  deleteTask: async (taskId: string): Promise<void> => {
    return apiRequest(
      () => apiClient.delete(`/tasks/${taskId}`),
      () => {
        const tasks = StorageEngine.getTasks();
        const target = tasks.find((t) => t.id === taskId);
        const filtered = tasks.filter((t) => t.id !== taskId);
        StorageEngine.setTasks(filtered);
        if (target) {
          taskService.syncProjectProgress(target.projectId, filtered);
        }
      }
    );
  },

  uploadEvidence: async (
    taskId: string,
    evidenceData: { title: string; fileName: string; uploaderName: string; description?: string }
  ): Promise<DeliverableEvidence> => {
    return apiRequest(
      () => apiClient.post<DeliverableEvidence>(`/tasks/${taskId}/evidence`, evidenceData),
      () => {
        const tasks = StorageEngine.getTasks();
        const newEvidence: DeliverableEvidence = {
          id: `ev-${Date.now()}`,
          title: evidenceData.title,
          fileName: evidenceData.fileName,
          description: evidenceData.description,
          fileUrl: '#',
          uploadedBy: evidenceData.uploaderName,
          uploadedAt: new Date().toISOString().split('T')[0],
          verifiedByGuide: false,
        };

        const updated = tasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              evidence: [...t.evidence, newEvidence],
            };
          }
          return t;
        });

        StorageEngine.setTasks(updated);

        StorageEngine.addAuditLog({
          userId: 'user-student-1',
          userName: evidenceData.uploaderName,
          userRole: 'STUDENT',
          action: 'UPLOAD_EVIDENCE',
          category: 'TASK',
          details: `Uploaded evidence "${evidenceData.title}" for task #${taskId}`,
          ipAddress: '127.0.0.1',
        });

        return newEvidence;
      }
    );
  },

  syncProjectProgress: (projectId: string, tasksList: Task[]) => {
    const projTasks = tasksList.filter((t) => t.projectId === projectId);
    if (projTasks.length === 0) return;
    const avg = Math.round(
      projTasks.reduce((acc, t) => acc + t.progressPercentage, 0) / projTasks.length
    );
    const projects = StorageEngine.getProjects();
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const health = avg < 35 ? 'CRITICAL' : avg < 60 ? 'AT_RISK' : 'ON_TRACK';
        return { ...p, progressPercentage: avg, health: health as Project['health'] };
      }
      return p;
    });
    StorageEngine.setProjects(updated);
  },
};
