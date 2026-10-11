export type Role = 'STUDENT' | 'GUIDE' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  department: string;
  avatarUrl?: string;
  enrollmentNumber?: string;
  designation?: string;
}

export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  roleInTeam: string;
}

export interface Project {
  id: string;
  title: string;
  code: string;
  description: string;
  department: string;
  academicYear: string;
  guideId: string;
  guideName: string;
  teamMembers: TeamMember[];
  health: ProjectHealth;
  progressPercentage: number;
  startDate: string;
  targetEndDate: string;
  status: 'PROPOSAL_PHASE' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED';
}

export type ProposalStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'MODIFICATION_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export interface ProposalHistoryEntry {
  id: string;
  timestamp: string;
  version: number;
  authorName: string;
  action: string;
  notes?: string;
}

export interface ProposalComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  comment: string;
  timestamp: string;
  sectionTarget?: string;
}

export interface ProjectProposal {
  id: string;
  projectId: string;
  projectTitle: string;
  problemStatement: string;
  objectives: string[];
  methodology: string;
  expectedOutcome: string;
  references: string[];
  teamMembers: TeamMember[];
  status: ProposalStatus;
  version: number;
  submittedAt?: string;
  updatedAt: string;
  guideComments: ProposalComment[];
  history: ProposalHistoryEntry[];
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskImportance = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DeliverableEvidence {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  uploadedBy: string;
  uploadedAt: string;
  verifiedByGuide?: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  proposedDeadline: string;
  dependencies: string[]; // Task IDs that this task depends on
  importance: TaskImportance;
  status: TaskStatus;
  progressPercentage: number;
  evidence: DeliverableEvidence[];
  estimatedDays: number;
  isOverdue?: boolean;
}

export interface Contribution {
  id: string;
  projectId: string;
  studentId: string;
  studentName: string;
  taskId?: string;
  taskTitle?: string;
  description: string;
  workCompleted: string;
  supportingEvidenceUrl?: string;
  supportingEvidenceName?: string;
  submissionDate: string;
  guideReviewed: boolean;
  guideRemarks?: string;
}

export type IssueStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'RESOLUTION_SUBMITTED'
  | 'GUIDE_VERIFIED'
  | 'CLOSED'
  | 'REOPENED';

export interface ProjectIssue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  reportedById: string;
  reportedByName: string;
  reportedAt: string;
  identifiedCause?: string;
  correctiveAction?: string;
  resolutionSummary?: string;
  learningNote?: string;
  status: IssueStatus;
  guideVerificationRemarks?: string;
  verifiedAt?: string;
}

export type ScoreTrend = 'IMPROVING' | 'DECLINING' | 'UNCHANGED';

export interface CriterionScore {
  criterion: 'Design' | 'Implementation' | 'Testing' | string;
  score: number; // 0-10 or 0-100
  maxScore: number;
  weightage: number; // percentage
  feedback: string;
  previousScore?: number;
}

export interface EvaluationRecord {
  id: string;
  projectId: string;
  reviewRound: number; // e.g. 1, 2, 3
  reviewRoundName: string; // e.g. "Phase 1 - Architectural Review"
  reviewDate: string;
  reviewerId: string;
  reviewerName: string;
  criteriaScores: CriterionScore[];
  totalScore: number;
  maxTotalScore: number;
  generalFeedback: string;
  requiredActions: string[];
  trend: ScoreTrend;
}

export type FeedbackStatus =
  | 'PENDING_ACTION'
  | 'STUDENT_SUBMITTED'
  | 'GUIDE_VERIFIED'
  | 'FURTHER_CORRECTION_REQUIRED';

export interface FeedbackResolutionItem {
  id: string;
  projectId: string;
  evaluationId: string;
  feedbackReceived: string;
  requiredAction: string;
  studentCorrection?: string;
  evidenceSubmissionUrl?: string;
  evidenceSubmissionName?: string;
  submittedAt?: string;
  guideVerificationNote?: string;
  status: FeedbackStatus;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  category: 'AUTH' | 'PROPOSAL' | 'TASK' | 'EVALUATION' | 'SYSTEM' | 'SECURITY';
  details: string;
  ipAddress: string;
}

export interface SystemStats {
  totalStudents: number;
  totalGuides: number;
  totalAdmins: number;
  totalProjects: number;
  completedProjects: number;
  pendingProposals: number;
  pendingEvaluations: number;
  averageProgress: number;
}
