import React, { useEffect, useState } from 'react';
import { issueService } from '../../services/issueService';
import { contributionService } from '../../services/contributionService';
import { projectService } from '../../services/projectService';
import { ProjectIssue, Contribution, Project } from '../../types';
import { PageHeader, Alert } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Textarea } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';

export const GuideIssuesVerificationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [activeTab, setActiveTab] = useState<'issues' | 'contributions'>('issues');

  // Issue verification modal
  const [targetIssue, setTargetIssue] = useState<ProjectIssue | null>(null);
  const [issueRemarks, setIssueRemarks] = useState('');

  // Contribution review modal
  const [targetContrib, setTargetContrib] = useState<Contribution | null>(null);
  const [contribRemarks, setContribRemarks] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getProjects();
      const primary = projects[0];
      if (primary) {
        const [iList, cList] = await Promise.all([
          issueService.getIssuesByProject(primary.id),
          contributionService.getContributionsByProject(primary.id),
        ]);
        setIssues(iList);
        setContributions(cList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIssue = async (status: 'GUIDE_VERIFIED' | 'CLOSED' | 'UNDER_REVIEW') => {
    if (!targetIssue || !issueRemarks.trim()) {
      alert('Please enter guide remarks before saving verification.');
      return;
    }
    try {
      await issueService.guideVerifyIssue(targetIssue.id, {
        status,
        guideRemarks: issueRemarks,
      });
      setTargetIssue(null);
      setIssueRemarks('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewContribution = async () => {
    if (!targetContrib || !contribRemarks.trim()) {
      alert('Please enter remarks for the student work log.');
      return;
    }
    try {
      await contributionService.reviewContribution(targetContrib.id, contribRemarks);
      setTargetContrib(null);
      setContribRemarks('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving student work and issue verification queue..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Diagnosis & Work Verification"
        description="Verify engineering blocker resolutions, validate student contributions, and record supervisory remarks"
      />

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#E6DCB8] pb-3">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'issues'
              ? 'bg-[#17243B] text-[#F6F0E5] shadow-xs'
              : 'bg-white text-[#536482] hover:bg-[#FAF5E8]'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-[#C6A15B]" />
          Project Issues ({issues.length})
        </button>
        <button
          onClick={() => setActiveTab('contributions')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'contributions'
              ? 'bg-[#17243B] text-[#F6F0E5] shadow-xs'
              : 'bg-white text-[#536482] hover:bg-[#FAF5E8]'
          }`}
        >
          <FileCheck className="w-4 h-4 text-[#C6A15B]" />
          Student Contributions ({contributions.length})
        </button>
      </div>

      {/* ISSUES TAB */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="border-l-4 border-l-[#C6A15B]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-xs font-semibold text-[#536482]">
                    Reported by {issue.reportedByName} on {issue.reportedAt}
                  </span>
                  <h4 className="text-sm font-bold text-[#17243B] mt-0.5">{issue.title}</h4>
                  <p className="text-xs text-[#536482] mt-1">{issue.description}</p>
                </div>
                <Badge
                  variant={
                    issue.status === 'GUIDE_VERIFIED' || issue.status === 'CLOSED'
                      ? 'success'
                      : issue.status === 'RESOLUTION_SUBMITTED'
                      ? 'gold'
                      : 'warning'
                  }
                  size="sm"
                  dot
                >
                  {issue.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Root Cause & Corrective Action */}
              {(issue.identifiedCause || issue.correctiveAction) && (
                <div className="my-3 p-3 rounded-lg bg-[#FAF5E8] border border-[#E6D09A] text-xs space-y-1.5">
                  <p>
                    <strong className="text-[#17243B]">Root Cause:</strong> {issue.identifiedCause}
                  </p>
                  <p>
                    <strong className="text-[#17243B]">Corrective Action:</strong> {issue.correctiveAction}
                  </p>
                  {issue.resolutionSummary && (
                    <p>
                      <strong className="text-[#17243B]">Resolution Proof:</strong> {issue.resolutionSummary}
                    </p>
                  )}
                  {issue.learningNote && (
                    <p className="text-[#7A5B22] font-medium">
                      ↳ Learning Note: {issue.learningNote}
                    </p>
                  )}
                </div>
              )}

              {issue.guideVerificationRemarks && (
                <div className="p-2.5 rounded-lg bg-[#EBF5EE] border border-[#C8E6C9] text-xs text-[#1B5E20] mb-2">
                  <strong>Verified by Guide:</strong> {issue.guideVerificationRemarks}
                </div>
              )}

              <div className="pt-2 border-t border-[#EFE8D8] flex justify-end">
                {issue.status !== 'GUIDE_VERIFIED' && issue.status !== 'CLOSED' && (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => {
                      setTargetIssue(issue);
                      setIssueRemarks('Root cause addressed thoroughly. Code review verified.');
                    }}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Verify &amp; Sign-Off Issue
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CONTRIBUTIONS TAB */}
      {activeTab === 'contributions' && (
        <div className="space-y-4">
          {contributions.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-[#17243B]">{c.description}</h4>
                  <p className="text-xs text-[#536482]">
                    Submitted by <strong>{c.studentName}</strong> on {c.submissionDate}
                  </p>
                </div>
                <Badge variant={c.guideReviewed ? 'success' : 'ivory'} size="sm">
                  {c.guideReviewed ? 'Reviewed' : 'Awaiting Review'}
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF5E8] border border-[#E6D09A] text-xs my-2">
                <strong className="text-[#17243B]">Work Completed:</strong>
                <p className="text-[#536482] mt-0.5 leading-relaxed">{c.workCompleted}</p>
                {c.supportingEvidenceName && (
                  <p className="text-[#2E7D32] font-semibold mt-1">
                    Proof Reference: {c.supportingEvidenceName}
                  </p>
                )}
              </div>

              {c.guideRemarks && (
                <div className="p-2.5 rounded-lg bg-[#EBF5EE] border border-[#C8E6C9] text-xs text-[#1B5E20] mb-2">
                  <strong>Guide Remarks:</strong> {c.guideRemarks}
                </div>
              )}

              <div className="pt-2 border-t border-[#EFE8D8] flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTargetContrib(c);
                    setContribRemarks('Solid engineering documentation. Verified for thesis portfolio.');
                  }}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  {c.guideReviewed ? 'Edit Remarks' : 'Record Guide Remarks'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* VERIFY ISSUE MODAL */}
      <Modal
        isOpen={!!targetIssue}
        onClose={() => setTargetIssue(null)}
        title="Verify Issue Resolution"
        subtitle={`Issue: ${targetIssue?.title}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Supervisory Verification Remarks"
            rows={4}
            value={issueRemarks}
            onChange={(e) => setIssueRemarks(e.target.value)}
            helperText="Include comments on the validity of the corrective action"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleVerifyIssue('UNDER_REVIEW')}
            >
              Request Further Evidence
            </Button>
            <Button
              type="button"
              variant="gold"
              onClick={() => handleVerifyIssue('GUIDE_VERIFIED')}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Verify Resolution
            </Button>
          </div>
        </div>
      </Modal>

      {/* REVIEW CONTRIBUTION MODAL */}
      <Modal
        isOpen={!!targetContrib}
        onClose={() => setTargetContrib(null)}
        title="Record Remarks on Student Contribution"
        subtitle={`Student: ${targetContrib?.studentName}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Supervisory Remarks"
            rows={4}
            value={contribRemarks}
            onChange={(e) => setContribRemarks(e.target.value)}
            helperText="Provide constructive appraisal of the student's documented proof of work"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button type="button" variant="outline" onClick={() => setTargetContrib(null)}>
              Cancel
            </Button>
            <Button type="button" variant="gold" onClick={handleReviewContribution}>
              Save Remarks
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
