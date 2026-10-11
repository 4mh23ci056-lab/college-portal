import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { proposalService } from '../../services/proposalService';
import { projectService } from '../../services/projectService';
import { ProjectProposal, Project } from '../../types';
import { PageHeader, Alert } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  FileText,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  MessageSquare,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';

const proposalSchema = z.object({
  projectTitle: z.string().min(5, 'Project title must be at least 5 characters'),
  problemStatement: z.string().min(30, 'Problem statement must be at least 30 characters'),
  methodology: z.string().min(30, 'Methodology must be at least 30 characters'),
  expectedOutcome: z.string().min(20, 'Expected outcome must be at least 20 characters'),
  objectivesText: z.string().min(15, 'Enter at least one clear objective'),
  referencesText: z.string().min(10, 'Enter at least one academic reference or citation'),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

export const ProposalPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [proposal, setProposal] = useState<ProjectProposal | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
  });

  const formValues = watch();

  useEffect(() => {
    loadProposal();
  }, []);

  const loadProposal = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getProjects();
      const primary = projects[0];
      setProject(primary);
      if (primary) {
        const prop = await proposalService.getProposalByProjectId(primary.id);
        if (prop) {
          setProposal(prop);
          reset({
            projectTitle: prop.projectTitle,
            problemStatement: prop.problemStatement,
            methodology: prop.methodology,
            expectedOutcome: prop.expectedOutcome,
            objectivesText: prop.objectives.join('\n'),
            referencesText: prop.references.join('\n'),
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Section completion check
  const completeness = {
    title: (formValues.projectTitle || '').trim().length >= 5,
    problem: (formValues.problemStatement || '').trim().length >= 30,
    objectives: (formValues.objectivesText || '').trim().length >= 15,
    methodology: (formValues.methodology || '').trim().length >= 30,
    outcome: (formValues.expectedOutcome || '').trim().length >= 20,
    references: (formValues.referencesText || '').trim().length >= 10,
  };

  const completedSectionsCount = Object.values(completeness).filter(Boolean).length;
  const isAllComplete = completedSectionsCount === 6;

  const handleSaveDraft = async () => {
    if (!proposal) return;
    try {
      const objectives = (formValues.objectivesText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const references = (formValues.referencesText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await proposalService.saveProposalDraft({
        ...proposal,
        projectTitle: formValues.projectTitle,
        problemStatement: formValues.problemStatement,
        methodology: formValues.methodology,
        expectedOutcome: formValues.expectedOutcome,
        objectives,
        references,
      });
      setProposal(updated);
      setSaveSuccess('Proposal draft saved successfully to institutional database.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (data: ProposalFormData) => {
    if (!proposal) return;
    try {
      const objectives = data.objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const references = data.referencesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await proposalService.submitProposal({
        ...proposal,
        projectTitle: data.projectTitle,
        problemStatement: data.problemStatement,
        methodology: data.methodology,
        expectedOutcome: data.expectedOutcome,
        objectives,
        references,
      });

      setProposal(updated);
      setSaveSuccess(
        proposal.status === 'MODIFICATION_REQUESTED'
          ? 'Revised proposal resubmitted to guide Dr. Ramesh Kulkarni for review.'
          : 'Proposal successfully submitted to assigned guide for evaluation!'
      );
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving institutional proposal specifications..." />;
  }

  const isLocked = proposal?.status === 'APPROVED';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Proposal Module"
        description="Institutional academic proposal drafting, requirements verification, and guide approval pipeline"
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
                  : 'ivory'
              }
              dot
            >
              Status: {proposal.status.replace(/_/g, ' ')} (v{proposal.version})
            </Badge>
          )
        }
      />

      {saveSuccess && (
        <Alert variant="success" title="Proposal Updated">
          {saveSuccess}
        </Alert>
      )}

      {/* Guide Feedback Alert if Modification Requested */}
      {proposal?.status === 'MODIFICATION_REQUESTED' && (
        <Alert variant="warning" title="Guide Requested Revisions">
          Your project guide Dr. Ramesh Kulkarni has requested modifications before final approval.
          Please review the comments below, edit the proposal, and resubmit.
        </Alert>
      )}

      {/* Grid: Form and Side Review Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Proposal Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title={`Proposal Document: ${project?.code || 'CSE-PRJ'}`}
              subtitle="Enter institutional research parameters and validation constraints"
              action={
                <span className="text-xs text-[#536482]">Version {proposal?.version || 1}</span>
              }
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Project Title"
                placeholder="Autonomous Drone Navigation & Disaster Mapping using Deep RL"
                disabled={isLocked}
                error={errors.projectTitle?.message}
                {...register('projectTitle')}
              />

              <Textarea
                label="Problem Statement & Clinical/Industrial Need"
                rows={4}
                placeholder="Explain the real-world limitation, disaster challenge or industry problem..."
                disabled={isLocked}
                error={errors.problemStatement?.message}
                helperText="Minimum 30 characters required by academic board"
                {...register('problemStatement')}
              />

              <Textarea
                label="Specific Research Objectives (One per line)"
                rows={4}
                placeholder="1. Develop edge-compatible deep RL path planning&#10;2. Calibrate sensor odometry with RealSense camera&#10;3. Achieve < 120ms obstacle avoidance latency"
                disabled={isLocked}
                error={errors.objectivesText?.message}
                {...register('objectivesText')}
              />

              <Textarea
                label="System Architecture & Methodology"
                rows={4}
                placeholder="Detail algorithms, simulation setup, hardware components, and evaluation phases..."
                disabled={isLocked}
                error={errors.methodology?.message}
                {...register('methodology')}
              />

              <Textarea
                label="Expected Outcome & Deliverables"
                rows={3}
                placeholder="Deployable drone prototype with real-time hazard mapping and >94% obstacle clearance accuracy..."
                disabled={isLocked}
                error={errors.expectedOutcome?.message}
                {...register('expectedOutcome')}
              />

              <Textarea
                label="Academic Literature References (One per line)"
                rows={3}
                placeholder="1. Mnih et al., Deep Q-networks, Nature 2015&#10;2. IEEE Transactions on Robotics, Fast-Planner 2021"
                disabled={isLocked}
                error={errors.referencesText?.message}
                {...register('referencesText')}
              />

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#EFE8D8] flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isLocked || isSubmitting}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save as Draft
                </Button>

                <div className="flex items-center gap-3">
                  {proposal?.status === 'MODIFICATION_REQUESTED' && (
                    <Button
                      type="submit"
                      variant="gold"
                      disabled={!isAllComplete || isSubmitting}
                      isLoading={isSubmitting}
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                    >
                      Resubmit Revised Proposal
                    </Button>
                  )}

                  {proposal?.status !== 'APPROVED' && proposal?.status !== 'MODIFICATION_REQUESTED' && (
                    <Button
                      type="submit"
                      variant="gold"
                      disabled={!isAllComplete || isSubmitting}
                      isLoading={isSubmitting}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      Submit to Guide for Review
                    </Button>
                  )}

                  {proposal?.status === 'APPROVED' && (
                    <span className="text-xs font-bold text-[#2E7D32] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Proposal Approved by Academic Guide
                    </span>
                  )}
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Sidebar: Completeness Checklist & Guide Comments */}
        <div className="space-y-6">
          {/* Missing Sections Before Submission Checklist */}
          <Card>
            <CardHeader
              title="Pre-Submission Checklist"
              subtitle={`${completedSectionsCount} of 6 sections satisfied`}
            />

            <div className="space-y-2.5">
              {[
                { label: 'Project Title', valid: completeness.title },
                { label: 'Problem Statement (30+ chars)', valid: completeness.problem },
                { label: 'Research Objectives', valid: completeness.objectives },
                { label: 'Methodology & Setup', valid: completeness.methodology },
                { label: 'Expected Outcome', valid: completeness.outcome },
                { label: 'Literature References', valid: completeness.references },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                    item.valid
                      ? 'border-[#C8E6C9] bg-[#EBF5EE] text-[#1B5E20]'
                      : 'border-[#F5B7B1] bg-[#FDEDEC] text-[#900C3F]'
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  {item.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-[#C70039]">Missing</span>
                  )}
                </div>
              ))}
            </div>

            {!isAllComplete && (
              <p className="text-[11px] text-[#8B1E1E] mt-3 font-medium">
                * All 6 sections must be filled before submission to the assigned guide.
              </p>
            )}
          </Card>

          {/* Guide Comments & Review Notes */}
          <Card>
            <CardHeader
              title="Guide Comments & Remarks"
              subtitle="Written feedback from Dr. Ramesh Kulkarni"
            />
            {proposal?.guideComments && proposal.guideComments.length > 0 ? (
              <div className="space-y-3">
                {proposal.guideComments.map((com) => (
                  <div key={com.id} className="p-3 rounded-lg bg-[#FAF5E8] border border-[#E6D09A]">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold text-[#17243B]">
                      <span>{com.authorName}</span>
                      <span className="text-[#536482]">{new Date(com.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-[#536482] leading-relaxed">{com.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#536482] italic">No guide remarks recorded yet.</p>
            )}
          </Card>

          {/* Proposal Version History */}
          <Card>
            <CardHeader
              title="Proposal Version History"
              subtitle="Full institutional audit trail"
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
