import {
  Project,
  ProjectProposal,
  Task,
  Contribution,
  ProjectIssue,
  EvaluationRecord,
  FeedbackResolutionItem,
  AuditLog,
  User,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_PROPOSAL,
  INITIAL_TASKS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_ISSUES,
  INITIAL_EVALUATIONS,
  INITIAL_FEEDBACK_RESOLUTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'protrack_db_users',
  PROJECTS: 'protrack_db_projects',
  PROPOSALS: 'protrack_db_proposals',
  TASKS: 'protrack_db_tasks',
  CONTRIBUTIONS: 'protrack_db_contributions',
  ISSUES: 'protrack_db_issues',
  EVALUATIONS: 'protrack_db_evaluations',
  FEEDBACK: 'protrack_db_feedback',
  AUDIT_LOGS: 'protrack_db_audit_logs',
};

// Helper to initialize or read from localStorage
function getStored<T>(key: string, initialData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return initialData;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const StorageEngine = {
  getUsers: (): User[] => getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  setUsers: (users: User[]) => setStored(STORAGE_KEYS.USERS, users),

  getProjects: (): Project[] => getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS),
  setProjects: (projects: Project[]) => setStored(STORAGE_KEYS.PROJECTS, projects),

  getProposals: (): ProjectProposal[] => getStored<ProjectProposal[]>(STORAGE_KEYS.PROPOSALS, [INITIAL_PROPOSAL]),
  setProposals: (proposals: ProjectProposal[]) => setStored(STORAGE_KEYS.PROPOSALS, proposals),

  getTasks: (): Task[] => getStored<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS),
  setTasks: (tasks: Task[]) => setStored(STORAGE_KEYS.TASKS, tasks),

  getContributions: (): Contribution[] => getStored<Contribution[]>(STORAGE_KEYS.CONTRIBUTIONS, INITIAL_CONTRIBUTIONS),
  setContributions: (contributions: Contribution[]) => setStored(STORAGE_KEYS.CONTRIBUTIONS, contributions),

  getIssues: (): ProjectIssue[] => getStored<ProjectIssue[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES),
  setIssues: (issues: ProjectIssue[]) => setStored(STORAGE_KEYS.ISSUES, issues),

  getEvaluations: (): EvaluationRecord[] => getStored<EvaluationRecord[]>(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS),
  setEvaluations: (evals: EvaluationRecord[]) => setStored(STORAGE_KEYS.EVALUATIONS, evals),

  getFeedbackItems: (): FeedbackResolutionItem[] => getStored<FeedbackResolutionItem[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK_RESOLUTIONS),
  setFeedbackItems: (items: FeedbackResolutionItem[]) => setStored(STORAGE_KEYS.FEEDBACK, items),

  getAuditLogs: (): AuditLog[] => getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  setAuditLogs: (logs: AuditLog[]) => setStored(STORAGE_KEYS.AUDIT_LOGS, logs),

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = StorageEngine.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    StorageEngine.setAuditLogs([newLog, ...logs]);
  },

  resetToInitial: () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.PROPOSALS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CONTRIBUTIONS);
    localStorage.removeItem(STORAGE_KEYS.ISSUES);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  },
};
