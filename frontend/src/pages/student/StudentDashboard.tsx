import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { evaluationService } from '../../services/evaluationService';
import { issueService } from '../../services/issueService';
import {
  Project,
  Task,
  EvaluationRecord,
  ProjectIssue,
  FeedbackResolutionItem,
} from '../../types';
import {
  PageHeader,
  StatCard,
  ProgressBar,
} from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackResolutionItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const projList = await projectService.getProjects();
      setProjects(projList);

      const activeProject = projList[0];
      if (activeProject) {
        const [taskList, evalList, issueList, fList] = await Promise.all([
          taskService.getTasksByProject(activeProject.id),
          evaluationService.getEvaluationsByProject(activeProject.id),
          issueService.getIssuesByProject(activeProject.id),
          evaluationService.getFeedbackItemsByProject(activeProject.id),
        ]);
        setTasks(taskList);
        setEvaluations(evalList);
        setIssues(issueList);
        setFeedbackItems(fList);
      }
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling academic telemetry and project health..." />;
  }

  const primaryProject = projects[0];
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const overdueTasks = tasks.filter((t) => t.isOverdue);
  const pendingFeedback = feedbackItems.filter((f) => f.status === 'PENDING_ACTION');
  const unresolvedIssues = issues.filter(
    (i) => i.status === 'REPORTED' || i.status === 'UNDER_REVIEW'
  );
  const latestEvaluation = evaluations[evaluations.length - 1];

  // Recharts data for criteria progression
  const evalChartData = evaluations.map((e) => ({
    name: `Phase ${e.reviewRound}`,
    Score: e.totalScore,
    Design: e.criteriaScores.find((c) => c.criterion === 'Design')?.score || 0,
    Implementation: e.criteriaScores.find((c) => c.criterion === 'Implementation')?.score || 0,
    Testing: e.criteriaScores.find((c) => c.criterion === 'Testing')?.score || 0,
  }));

  const taskDistribution = [
    { name: 'Completed', count: tasks.filter((t) => t.status === 'COMPLETED').length, fill: '#1B5E20' },
    { name: 'In Progress', count: tasks.filter((t) => t.status === 'IN_PROGRESS').length, fill: '#C6A15B' },
    { name: 'Not Started', count: tasks.filter((t) => t.status === 'NOT_STARTED').length, fill: '#8FA8CE' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <PageHeader
        title={`Welcome back, ${user?.name}`}
        description="Institutional Project Monitoring & Continuous Improvement Overview"
        badge={
          primaryProject && (
            <Badge
              variant={
                primaryProject.health === 'ON_TRACK'
                  ? 'success'
                  : primaryProject.health === 'AT_RISK'
                  ? 'warning'
                  : 'danger'
              }
              dot
            >
              Health: {primaryProject.health.replace('_', ' ')}
            </Badge>
          )
        }
        actions={
          <div className="flex gap-2">
            <Link to="/student/proposal">
              <Button variant="outline" size="sm">
                View Proposal
              </Button>
            </Link>
            <Link to="/student/tasks">
              <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Manage Tasks
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={projects.length}
          subtitle={`Lead on ${primaryProject?.code || 'CSE-PRJ-2026'}`}
          icon={<FolderKanban className="w-5 h-5" />}
        />

        <StatCard
          title="Overall Progress"
          value={`${primaryProject?.progressPercentage || 0}%`}
          subtitle="Calculated across 6 milestone tasks"
          trend="up"
          trendValue="+14% this phase"
          icon={<CheckCircle className="w-5 h-5" />}
        />

        <StatCard
          title="Pending / Overdue Tasks"
          value={`${pendingTasks.length} / ${overdueTasks.length}`}
          subtitle={overdueTasks.length > 0 ? `${overdueTasks.length} requires attention` : 'No overdue tasks'}
          trend={overdueTasks.length > 0 ? 'down' : 'neutral'}
          trendValue={overdueTasks.length > 0 ? 'Attention' : 'On Track'}
          icon={<Clock className="w-5 h-5" />}
        />

        <StatCard
          title="Pending Feedback / Issues"
          value={`${pendingFeedback.length} / ${unresolvedIssues.length}`}
          subtitle="Guide review actions"
          icon={<ShieldAlert className="w-5 h-5" />}
        />
      </div>

      {/* Main Project Overview Card */}
      {primaryProject && (
        <Card className="border-l-4 border-l-[#C6A15B]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EFE8D8]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
                  {primaryProject.code}
                </span>
                <span className="text-xs text-[#536482]">•</span>
                <span className="text-xs text-[#536482]">Assigned Guide: {primaryProject.guideName}</span>
              </div>
              <h2 className="text-xl font-bold text-[#17243B]">{primaryProject.title}</h2>
              <p className="text-xs text-[#536482] mt-1 max-w-3xl">{primaryProject.description}</p>
            </div>

            <div className="w-full lg:w-72 bg-[#FCFAF6] p-4 rounded-xl border border-[#DDD0B6] shrink-0">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-[#17243B]">Project Progress</span>
                <span className="font-extrabold text-[#C6A15B]">{primaryProject.progressPercentage}%</span>
              </div>
              <ProgressBar value={primaryProject.progressPercentage} showLabel={false} color="gold" />
              <div className="flex justify-between items-center text-[10px] text-[#536482] mt-2">
                <span>Start: {primaryProject.startDate}</span>
                <span>Deadline: {primaryProject.targetEndDate}</span>
              </div>
            </div>
          </div>

          {/* Team Members Chips */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#17243B]">Team Roster:</span>
              {primaryProject.teamMembers.map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5E8] border border-[#E6D09A] text-xs font-medium text-[#17243B]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
                  {member.name} ({member.enrollmentNumber})
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link to="/student/simulator">
                <Button variant="outline" size="sm" leftIcon={<Clock className="w-3.5 h-3.5" />}>
                  What-If Delay Simulator
                </Button>
              </Link>
              <Link to="/student/improvement-report">
                <Button variant="navy" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Improvement Report
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Two-Column Analytics & Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guide Evaluation History & Score Trends */}
        <Card>
          <CardHeader
            title="Evaluation Score Trajectory"
            subtitle="Historical score trends across review phases (No overwriting)"
            action={
              latestEvaluation && (
                <Badge variant={latestEvaluation.trend === 'IMPROVING' ? 'success' : 'ivory'} dot>
                  Trend: {latestEvaluation.trend}
                </Badge>
              )
            }
          />

          <div className="h-60 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evalChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DCB8" />
                <XAxis dataKey="name" stroke="#536482" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#536482" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FCFAF6', borderColor: '#DDD0B6', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="Score" stroke="#C6A15B" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Design" stroke="#17243B" strokeWidth={2} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="Implementation" stroke="#2E7D32" strokeWidth={2} />
                <Line type="monotone" dataKey="Testing" stroke="#597CAD" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {latestEvaluation && (
            <div className="bg-[#FAF5E8] p-3.5 rounded-xl border border-[#E6D09A]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#17243B]">{latestEvaluation.reviewRoundName}</span>
                <span className="text-xs font-black text-[#C6A15B]">
                  {latestEvaluation.totalScore} / {latestEvaluation.maxTotalScore}
                </span>
              </div>
              <p className="text-xs text-[#536482] italic">"{latestEvaluation.generalFeedback}"</p>
              <div className="mt-2 pt-2 border-t border-[#E6D09A] flex items-center justify-between text-[11px]">
                <span className="text-[#536482]">Evaluated by: {latestEvaluation.reviewerName}</span>
                <span className="text-[#536482]">Date: {latestEvaluation.reviewDate}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Task Completion Status & Upcoming Deadlines */}
        <Card>
          <CardHeader
            title="Milestone Tasks & Deadlines"
            subtitle="Prioritized deliverable queue with dependency mapping"
            action={
              <Link to="/student/tasks" className="text-xs font-semibold text-[#C6A15B] hover:underline">
                View All ({tasks.length})
              </Link>
            }
          />

          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-[#EFE8D8] bg-[#FDFAF5] hover:border-[#C6A15B] transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        task.importance === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : task.importance === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.importance}
                    </span>
                    <span className="text-xs font-bold text-[#17243B] truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#536482]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {task.proposedDeadline}
                    </span>
                    <span>Assigned: {task.assignedToName}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge
                    variant={
                      task.status === 'COMPLETED'
                        ? 'success'
                        : task.status === 'IN_PROGRESS'
                        ? 'gold'
                        : 'ivory'
                    }
                    size="sm"
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                  {task.isOverdue && (
                    <span className="block text-[10px] font-bold text-rose-700 mt-1">OVERDUE</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#EFE8D8] flex items-center justify-between">
            <span className="text-xs text-[#536482]">
              {tasks.filter((t) => t.status === 'COMPLETED').length} of {tasks.length} tasks completed
            </span>
            <Link to="/student/contributions">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Log Contributions
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Feedback Resolution & Issue Quick Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Feedback Correction Tracker */}
        <Card>
          <CardHeader
            title="Guide Feedback Action Items"
            subtitle="Corrections required by assigned guide Dr. Ramesh Kulkarni"
            action={
              <Badge variant="gold" size="sm">
                {feedbackItems.filter((f) => f.status !== 'GUIDE_VERIFIED').length} Pending Action
              </Badge>
            }
          />
          <div className="space-y-3">
            {feedbackItems.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-[#E6DCB8] bg-[#FDFAF5]">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-semibold text-[#17243B]">{item.requiredAction}</p>
                  <Badge
                    variant={
                      item.status === 'GUIDE_VERIFIED'
                        ? 'success'
                        : item.status === 'STUDENT_SUBMITTED'
                        ? 'gold'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {item.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {item.studentCorrection && (
                  <p className="text-[11px] text-[#536482] mt-1 bg-white p-2 rounded border border-[#EFE8D8]">
                    <strong className="text-[#17243B]">Your Correction:</strong> {item.studentCorrection}
                  </p>
                )}
                {item.guideVerificationNote && (
                  <p className="text-[11px] text-[#2E7D32] mt-1">
                    ✓ Guide Note: {item.guideVerificationNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Project Issues & Corrective Action */}
        <Card>
          <CardHeader
            title="Project Issue & Root Cause Tracker"
            subtitle="Engineering obstacles and documented learnings"
            action={
              <Link to="/student/issues">
                <Button variant="outline" size="sm" leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}>
                  Report Issue
                </Button>
              </Link>
            }
          />
          <div className="space-y-3">
            {issues.slice(0, 2).map((issue) => (
              <div key={issue.id} className="p-3 rounded-lg border border-[#E6DCB8] bg-[#FDFAF5]">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-[#17243B]">{issue.title}</h4>
                  <Badge
                    variant={
                      issue.status === 'GUIDE_VERIFIED'
                        ? 'success'
                        : issue.status === 'RESOLUTION_SUBMITTED'
                        ? 'gold'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {issue.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#536482] line-clamp-2">{issue.description}</p>
                {issue.learningNote && (
                  <div className="mt-2 p-2 rounded bg-[#FAF5E8] text-[11px] text-[#7A5B22] border border-[#E6D09A]">
                    <strong>Learning Note:</strong> {issue.learningNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
