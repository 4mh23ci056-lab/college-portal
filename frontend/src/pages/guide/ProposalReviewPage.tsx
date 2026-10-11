import React, { useEffect, useState } from 'react';
import { proposalService } from '../../services/proposalService';
import { projectService } from '../../services/projectService';
import { ProjectProposal, Project } from '../../types';
import { PageHeader, Alert } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  History,
  Send,
} from 'lucide-react';

export const ProposalReviewPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<ProjectProposal | null>(null);
  const [guideComment, setGuideComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProposal();
  }, []);

  const loadProposal = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getProjects();
      const primary = projects[0];
      if (primary) {
        const prop = await proposalService.getProposalByProjectId(primary.id);
        if (prop) setProposal(prop);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDecision = async (
    status: 'APPROVED' | 'MODIFICATION_REQUESTED' | 'REJECTED'
  ) => {
    if (!proposal || !guideComment.trim()) {
      alert('Please enter formal written guide remarks before recording your review decision.');
      return;
    }
    try {
      const updated = await proposalService.guideReviewProposal(
        proposal.id,
        status,
        guideComment,
        'Dr. Ramesh Kulkarni (Guide)'
      );
      setProposal(updated);
      setReviewSuccess(`Decision recorded: Proposal status set to ${status}. Notification dispatched.`);
      setGuideComment('');
      setTimeout(() => setReviewSuccess(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving submitted student proposal..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposal Review & Formal Clearance"
        description="Faculty guide assessment, methodology vetting, and modification requests for submitted student proposals"
        badge={
          proposal && (
            <Badge
              variant={
                proposal.status === 'APPROVED'
                  ? 'success'
                  : proposal.status === 'PENDING_REVIEW'
                  ? 'gold'
                  : proposal.status === 'MODIFICATION_REQUESTED'
                  ? 'warning'
                  : 'danger'
              }
              size="sm"
              dot
            >
              Status: {proposal.status.replace(/_/g, ' ')} (Version {proposal.version})
            </Badge>
          )
        }
      />

      {reviewSuccess && (
        <Alert variant="success" title="Review Concluded">
          {reviewSuccess}
        </Alert>
      )}

      {/* Grid: Proposal Content & Guide Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title={proposal?.projectTitle || 'Project Proposal'}
              subtitle={`Version ${proposal?.version} | Submitted: ${proposal?.submittedAt ? new Date(proposal.submittedAt).toLocaleDateString() : 'N/A'}`}
            />

            <div className="space-y-5 text-xs">
              <div>
                <h4 className="font-bold text-[#17243B] uppercase text-[11px] mb-1">
                  Problem Statement &amp; Need:
                </h4>
                <p className="text-[#536482] leading-relaxed bg-[#FDFAF5] p-3 rounded-lg border border-[#EFE8D8]">
                  {proposal?.problemStatement}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#17243B] uppercase text-[11px] mb-1">
                  Specific Objectives:
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-[#536482] bg-[#FDFAF5] p-3 rounded-lg border border-[#EFE8D8]">
                  {proposal?.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#17243B] uppercase text-[11px] mb-1">
                  Methodology &amp; Architecture:
                </h4>
                <p className="text-[#536482] leading-relaxed bg-[#FDFAF5] p-3 rounded-lg border border-[#EFE8D8]">
                  {proposal?.methodology}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#17243B] uppercase text-[11px] mb-1">
                  Expected Outcome:
                </h4>
                <p className="text-[#536482] leading-relaxed bg-[#FDFAF5] p-3 rounded-lg border border-[#EFE8D8]">
                  {proposal?.expectedOutcome}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#17243B] uppercase text-[11px] mb-1">
                  References &amp; Literature:
                </h4>
                <ul className="list-decimal pl-5 space-y-1 text-[#536482] bg-[#FDFAF5] p-3 rounded-lg border border-[#EFE8D8]">
                  {proposal?.references.map((ref, i) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Guide Assessment Box */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-[#C6A15B]">
            <CardHeader
              title="Record Guide Evaluation"
              subtitle="Approve or request required modifications"
            />

            <div className="space-y-4">
              <Textarea
                label="Faculty Guide Written Remarks & Required Actions"
                rows={5}
                placeholder="Provide detailed feedback on methodology feasibility, budget constraints, or missing safety analyses..."
                value={guideComment}
                onChange={(e) => setGuideComment(e.target.value)}
                helperText="Required before recording decision"
              />

              <div className="space-y-2 pt-2">
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => handleReviewDecision('APPROVED')}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Approve Proposal
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleReviewDecision('MODIFICATION_REQUESTED')}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Request Modifications
                </Button>
              </div>
            </div>
          </Card>

          {/* Proposal Version History */}
          <Card>
            <CardHeader
              title="Audit Trail & Prior Revisions"
              subtitle="Full submission history"
            />
            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DDD0B6]">
              {proposal?.history.map((h) => (
                <div key={h.id} className="relative text-xs">
                  <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-[#C6A15B]" />
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#17243B]">{h.action}</span>
                    <span className="text-[10px] text-[#536482]">v{h.version}</span>
                  </div>
                  <p className="text-[11px] text-[#536482] mt-0.5">{h.notes}</p>
                  <p className="text-[10px] text-[#8FA8CE]">{new Date(h.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
