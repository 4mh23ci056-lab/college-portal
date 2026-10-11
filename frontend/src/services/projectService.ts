import { apiClient, apiRequest } from './api';
import { StorageEngine } from './storage';
import { Project, Task } from '../types';

export interface SimulationResult {
  simulatedTaskId: string;
  simulatedTaskTitle: string;
  delayDays: number;
  originalProjectEndDate: string;
  projectedNewEndDate: string;
  totalScheduleShiftDays: number;
  criticalPathImpact: boolean;
  affectedTasks: {
    taskId: string;
    taskTitle: string;
    originalDeadline: string;
    projectedNewDeadline: string;
    daysShifted: number;
    assignedToName: string;
  }[];
}

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    return apiRequest(
      () => apiClient.get<Project[]>('/projects'),
      () => StorageEngine.getProjects()
    );
  },

  getProjectById: async (id: string): Promise<Project | undefined> => {
    return apiRequest(
      () => apiClient.get<Project>(`/projects/${id}`),
      () => {
        const projects = StorageEngine.getProjects();
        return projects.find((p) => p.id === id) || projects[0];
      }
    );
  },

  updateProjectProgress: async (id: string, progressPercentage: number): Promise<Project> => {
    return apiRequest(
      () => apiClient.patch<Project>(`/projects/${id}/progress`, { progressPercentage }),
      () => {
        const projects = StorageEngine.getProjects();
        const updated = projects.map((p) => {
          if (p.id === id) {
            const health = progressPercentage < 40 ? 'CRITICAL' : progressPercentage < 65 ? 'AT_RISK' : 'ON_TRACK';
            return { ...p, progressPercentage, health: health as Project['health'] };
          }
          return p;
        });
        StorageEngine.setProjects(updated);
        return updated.find((p) => p.id === id)!;
      }
    );
  },

  // Deadline What-If Simulator: does NOT modify actual deadlines
  simulateDeadlineDelay: async (taskId: string, delayDays: number): Promise<SimulationResult> => {
    const tasks = StorageEngine.getTasks();
    const projects = StorageEngine.getProjects();
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) {
      throw new Error('Task not found for simulation');
    }

    const project = projects.find((p) => p.id === targetTask.projectId) || projects[0];

    // Find all downstream dependent tasks recursively
    const affectedTaskMap = new Map<string, number>(); // taskId -> cumulative delay

    function traceDependents(currentTaskId: string, accumulatedDelay: number) {
      const directDependents = tasks.filter((t) => t.dependencies.includes(currentTaskId));
      for (const dep of directDependents) {
        const currentMax = affectedTaskMap.get(dep.id) || 0;
        if (accumulatedDelay > currentMax) {
          affectedTaskMap.set(dep.id, accumulatedDelay);
          traceDependents(dep.id, accumulatedDelay);
        }
      }
    }

    traceDependents(taskId, delayDays);

    const affectedTasksList = Array.from(affectedTaskMap.entries()).map(([depId, shift]) => {
      const depTask = tasks.find((t) => t.id === depId)!;
      const originalDate = new Date(depTask.proposedDeadline);
      const newDate = new Date(originalDate);
      newDate.setDate(newDate.getDate() + shift);

      return {
        taskId: depTask.id,
        taskTitle: depTask.title,
        originalDeadline: depTask.proposedDeadline,
        projectedNewDeadline: newDate.toISOString().split('T')[0],
        daysShifted: shift,
        assignedToName: depTask.assignedToName,
      };
    });

    const origEnd = new Date(project.targetEndDate);
    const newEnd = new Date(origEnd);
    newEnd.setDate(newEnd.getDate() + delayDays);

    return {
      simulatedTaskId: targetTask.id,
      simulatedTaskTitle: targetTask.title,
      delayDays,
      originalProjectEndDate: project.targetEndDate,
      projectedNewEndDate: newEnd.toISOString().split('T')[0],
      totalScheduleShiftDays: delayDays,
      criticalPathImpact: targetTask.importance === 'CRITICAL' || affectedTasksList.length > 0,
      affectedTasks: affectedTasksList,
    };
  },

  submitFinalProject: async (
    projectId: string,
    submissionData: { reportUrl: string; repositoryUrl: string; notes: string }
  ): Promise<Project> => {
    return apiRequest(
      () => apiClient.post<Project>(`/projects/${projectId}/final-submission`, submissionData),
      () => {
        const projects = StorageEngine.getProjects();
        const updated = projects.map((p) =>
          p.id === projectId
            ? { ...p, status: 'COMPLETED' as const, progressPercentage: 100, health: 'ON_TRACK' as const }
            : p
        );
        StorageEngine.setProjects(updated);

        StorageEngine.addAuditLog({
          userId: 'user-student-1',
          userName: 'Sinchana Rao',
          userRole: 'STUDENT',
          action: 'FINAL_PROJECT_SUBMITTED',
          category: 'SYSTEM',
          details: `Submitted final dissertation & code repository for project ${projectId}`,
          ipAddress: '127.0.0.1',
        });

        return updated.find((p) => p.id === projectId)!;
      }
    );
  },
};
