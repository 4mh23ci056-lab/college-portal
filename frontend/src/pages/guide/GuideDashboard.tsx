import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { proposalService } from '../../services/proposalService';
import { evaluationService } from '../../services/evaluationService';
import { issueService } from '../../services/issueService';
import {
  Project,
  ProjectProposal,
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
  FolderGit2,
  BookOpen,
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const GuideDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackResolutionItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const projList = await projectService.getProjects();
      setProjects(projList);

      const active = projList[0];
      if (active) {
        const [prop, evals, iss, fItems] = await Promise.all([
          proposalService.getProposalByProjectId(active.id),
          evaluationService.getEvaluationsByProject(active.id),
          issueService.getIssuesByProject(active.id),
          evaluationService.getFeedbackItemsByProject(active.id),
        ]);
        if (prop) setProposals([prop]);
        setEvaluations(evals);
        setIssues(iss);
        setFeedbackItems(fItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling faculty guide supervisory dashboard..." />;
  }

  const pendingProposals = proposals.filter((p) => p.status === 'PENDING_REVIEW');
  const pendingCorrectionVerification = feedbackItems.filter((f) => f.status === 'STUDENT_SUBMITTED');
  const unresolvedIssues = issues.filter((i) => i.status === 'REPORTED' || i.status === 'RESOLUTION_SUBMITTED');
  const atRiskProjects = projects.filter((p) => p.health === 'AT_RISK' || p.health === 'CRITICAL');

  // Chart data: compare projects progress
  const progressChartData = projects.map((p) => ({
    name: p.code,
    Progress: p.progressPercentage,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Faculty Guide Portal — ${user?.name}`}
        description="Supervisory oversight of assigned student cohorts, milestone evaluation cycles, and remediation pipelines"
        badge={
          <Badge variant="navy" size="sm" dot>
            {projects.length} Active Assigned Cohorts
          </Badge>
        }
        actions={
          <div className="flex gap-2">
            <Link to="/guide/evaluations">
              <Button variant="gold" size="sm" leftIcon={<ClipboardCheck className="w-4 h-4" />}>
                Record Evaluation
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary Supervisory KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Projects"
          value={projects.length}
          subtitle="Department cohorts supervised"
          icon={<FolderGit2 className="w-5 h-5" />}
        />

        <StatCard
          title="Proposals Pending Review"
          value={pendingProposals.length}
          subtitle="Awaiting guide approval"
          trend={pendingProposals.length > 0 ? 'down' : 'neutral'}
          trendValue={pendingProposals.length > 0 ? 'Action Req.' : 'Clear'}
          icon={<BookOpen className="w-5 h-5" />}
        />

        <StatCard
          title="Corrections to Verify"
          value={pendingCorrectionVerification.length}
          subtitle="Student submissions pending"
          trend="up"
          trendValue="Ready"
          icon={<ShieldCheck className="w-5 h-5" />}
        />

        <StatCard
          title="Unresolved Issues"
          value={unresolvedIssues.length}
          subtitle={`${atRiskProjects.length} projects requiring attention`}
          trend={atRiskProjects.length > 0 ? 'down' : 'neutral'}
          trendValue={atRiskProjects.length > 0 ? `${atRiskProjects.length} At Risk` : 'Nominal'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Projects Requiring Attention Alert if any */}
      {atRiskProjects.length > 0 && (
        <div className="p-4 rounded-xl border border-[#F5B7B1] bg-[#FDEDEC] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#C70039] shrink-0 mt-0.5" />
          <div className="text-xs text-[#900C3F]">
            <strong className="text-sm block mb-0.5">Faculty Advisory: Projects Requiring Attention</strong>
            {atRiskProjects.map((p) => p.title).join(', ')} currently have overdue milestones or critical blockers.
            Immediate supervisory intervention recommended.
          </div>
        </div>
      )}

      {/* Assigned Projects Table & Progress Velocity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Assigned Student Projects & Health Matrix"
              subtitle="Current milestone completion status and assigned teams"
              action={
                <Link to="/guide/projects" className="text-xs font-semibold text-[#C6A15B] hover:underline">
                  Manage All
                </Link>
              }
            />

            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-[#E6DCB8] bg-[#FDFAF5] hover:border-[#C6A15B] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#C6A15B]">{proj.code}</span>
                        <span className="text-xs text-[#536482]">• {proj.department}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#17243B]">{proj.title}</h4>
                      <p className="text-xs text-[#536482] mt-0.5">
                        Lead: {proj.teamMembers[0]?.name || 'Student Lead'} ({proj.teamMembers.length} Members)
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge
                        variant={
                          proj.health === 'ON_TRACK'
                            ? 'success'
                            : proj.health === 'AT_RISK'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                        dot
                      >
                        {proj.health.replace('_', ' ')}
                      </Badge>
                      <span className="block text-xs font-extrabold text-[#17243B] mt-1">
                        {proj.progressPercentage}%
                      </span>
                    </div>
                  </div>

                  <ProgressBar value={proj.progressPercentage} showLabel={false} color="gold" size="sm" />

                  <div className="mt-3 pt-2 border-t border-[#EFE8D8] flex items-center justify-between text-xs">
                    <span className="text-[#536482]">Target End: {proj.targetEndDate}</span>
                    <div className="flex items-center gap-2">
                      <Link to="/guide/evaluations">
                        <Button variant="outline" size="sm">
                          Evaluate
                        </Button>
                      </Link>
                      <Link to="/guide/feedback-tracker">
                        <Button variant="gold" size="sm">
                          Verify Work
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Chart: Cross-Project Velocity */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Cohort Progress Comparison"
              subtitle="Progress completion rates across assigned teams"
            />
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6DCB8" />
                  <XAxis dataKey="name" stroke="#536482" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#536482" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FCFAF6', borderColor: '#DDD0B6', borderRadius: '8px' }}
                  />
                  <Bar dataKey="Progress" fill="#C6A15B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Verification Queue */}
          <Card>
            <CardHeader
              title="Pending Action Queue"
              subtitle="Student submissions awaiting guide verification"
            />
            <div className="space-y-2.5">
              {pendingCorrectionVerification.length > 0 ? (
                pendingCorrectionVerification.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-[#FAF5E8] border border-[#E6D09A] text-xs">
                    <p className="font-bold text-[#17243B]">{item.requiredAction}</p>
                    <p className="text-[11px] text-[#536482] mt-0.5">Submitted: {item.studentCorrection}</p>
                    <div className="mt-2 text-right">
                      <Link to="/guide/feedback-tracker">
                        <span className="text-[11px] font-bold text-[#C6A15B] hover:underline">
                          Verify in Tracker →
                        </span>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-[#536482]">
                  All student corrections are currently up-to-date and verified.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
