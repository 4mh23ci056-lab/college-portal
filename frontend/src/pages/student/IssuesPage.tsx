import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { issueService } from '../../services/issueService';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { ProjectIssue, Task, Project } from '../../types';
import { PageHeader } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  FileCheck,
  Send,
} from 'lucide-react';

const reportIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  taskId: z.string().optional(),
});

type ReportIssueFormData = z.infer<typeof reportIssueSchema>;

const resolutionSchema = z.object({
  identifiedCause: z.string().min(15, 'Root cause analysis required'),
  correctiveAction: z.string().min(15, 'Corrective action required'),
  resolutionSummary: z.string().min(20, 'Resolution summary required'),
  learningNote: z.string().min(15, 'Academic learning note required'),
});

type ResolutionFormData = z.infer<typeof resolutionSchema>;

export const IssuesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [resolveTargetIssue, setResolveTargetIssue] = useState<ProjectIssue | null>(null);

  const reportForm = useForm<ReportIssueFormData>({
    resolver: zodResolver(reportIssueSchema),
  });

  const resolveForm = useForm<ResolutionFormData>({
    resolver: zodResolver(resolutionSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getProjects();
      const primary = projects[0];
      setProject(primary);
      if (primary) {
        const [tList, iList] = await Promise.all([
          taskService.getTasksByProject(primary.id),
          issueService.getIssuesByProject(primary.id),
        ]);
        setTasks(tList);
        setIssues(iList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = async (data: ReportIssueFormData) => {
    if (!project) return;
    try {
      const selectedTask = tasks.find((t) => t.id === data.taskId);
      await issueService.reportIssue({
        projectId: project.id,
        title: data.title,
        description: data.description,
        relatedTaskId: data.taskId,
        relatedTaskTitle: selectedTask?.title,
        reportedById: 'user-student-1',
        reportedByName: 'Sinchana Rao',
      });

      setIsReportModalOpen(false);
      reportForm.reset();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveIssue = async (data: ResolutionFormData) => {
    if (!resolveTargetIssue) return;
    try {
      await issueService.submitResolution(resolveTargetIssue.id, data);
      setResolveTargetIssue(null);
      resolveForm.reset();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving project issue repository..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Management & Corrective Actions"
        description="Engineering obstacle diagnosis, root cause analysis, resolution submission and academic learning documentation"
        actions={
          <Button
            variant="gold"
            onClick={() => setIsReportModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Report New Issue
          </Button>
        }
      />

      {/* Issues List */}
      <div className="space-y-4">
        {issues.map((issue) => (
          <Card key={issue.id} className="border-l-4 border-l-[#17243B]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#536482]">
                    Reported by {issue.reportedByName} on {issue.reportedAt}
                  </span>
                  {issue.relatedTaskTitle && (
                    <span className="text-xs text-[#C6A15B] font-bold">
                      • Related Task: {issue.relatedTaskTitle}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#17243B]">{issue.title}</h3>
                <p className="text-xs text-[#536482] mt-1">{issue.description}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
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
            </div>

            {/* Root Cause & Corrective Action Grid */}
            {(issue.identifiedCause || issue.correctiveAction) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 p-3.5 rounded-xl bg-[#FAF5E8] border border-[#E6D09A]">
                <div>
                  <h4 className="text-xs font-bold text-[#17243B] mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#C6A15B]" />
                    Identified Root Cause:
                  </h4>
                  <p className="text-xs text-[#536482] leading-relaxed">{issue.identifiedCause}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#17243B] mb-1 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
                    Corrective Action Implemented:
                  </h4>
                  <p className="text-xs text-[#536482] leading-relaxed">{issue.correctiveAction}</p>
                </div>
              </div>
            )}

            {/* Academic Learning Note */}
            {issue.learningNote && (
              <div className="p-3 rounded-lg bg-[#EBF5EE] border border-[#C8E6C9] mb-3 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1B5E20]">
                  <strong>Institutional Learning Note:</strong> {issue.learningNote}
                </div>
              </div>
            )}

            {/* Guide Remarks */}
            {issue.guideVerificationRemarks && (
              <div className="p-2.5 rounded-lg bg-[#F0F4F9] border border-[#BDCDE5] text-xs text-[#1D3050] mb-3">
                <strong>Guide Verification Note:</strong> {issue.guideVerificationRemarks}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-[#EFE8D8] flex items-center justify-between">
              <span className="text-xs text-[#536482]">
                {issue.status === 'REPORTED'
                  ? 'Awaiting root cause diagnosis and corrective action submission'
                  : issue.status === 'RESOLUTION_SUBMITTED'
                  ? 'Resolution submitted for guide sign-off'
                  : 'Resolution verified by guide Dr. Ramesh Kulkarni'}
              </span>

              {issue.status === 'REPORTED' && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setResolveTargetIssue(issue)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Submit Resolution
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* REPORT ISSUE MODAL */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Project Issue / Blocker"
        subtitle="Log technical, hardware, or algorithmic bottleneck"
        maxWidth="lg"
      >
        <form onSubmit={reportForm.handleSubmit(handleReportIssue)} className="space-y-4">
          <Input
            label="Issue Title"
            placeholder="e.g. Jetson Orin Nano GPU Memory Exhaustion with High-Res Feeds"
            error={reportForm.formState.errors.title?.message}
            {...reportForm.register('title')}
          />

          <Select label="Related Project Task (Optional)" {...reportForm.register('taskId')}>
            <option value="">Select related task...</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>

          <Textarea
            label="Observed Issue & Technical Symptoms"
            rows={4}
            placeholder="Describe what occurred, error logs, and impact on project timeline..."
            error={reportForm.formState.errors.description?.message}
            {...reportForm.register('description')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={reportForm.formState.isSubmitting}>
              Report Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* RESOLUTION SUBMISSION MODAL */}
      <Modal
        isOpen={!!resolveTargetIssue}
        onClose={() => setResolveTargetIssue(null)}
        title="Submit Issue Resolution & Learnings"
        subtitle={`Resolving: ${resolveTargetIssue?.title}`}
        maxWidth="lg"
      >
        <form onSubmit={resolveForm.handleSubmit(handleResolveIssue)} className="space-y-4">
          <Textarea
            label="Identified Root Cause"
            rows={3}
            placeholder="Explain why the failure occurred (e.g. memory leak, race condition, incorrect baud rate)..."
            error={resolveForm.formState.errors.identifiedCause?.message}
            {...resolveForm.register('identifiedCause')}
          />

          <Textarea
            label="Corrective Action Implemented"
            rows={3}
            placeholder="Describe exact architectural or code changes made to eliminate the issue..."
            error={resolveForm.formState.errors.correctiveAction?.message}
            {...resolveForm.register('correctiveAction')}
          />

          <Textarea
            label="Resolution Verification Summary"
            rows={3}
            placeholder="Quantitative evidence that problem is resolved (e.g. VRAM dropped to 48%, 45-minute sustained test)..."
            error={resolveForm.formState.errors.resolutionSummary?.message}
            {...resolveForm.register('resolutionSummary')}
          />

          <Textarea
            label="Academic Learning Note"
            rows={3}
            placeholder="Key engineering lesson learned for inclusion in dissertation/thesis..."
            error={resolveForm.formState.errors.learningNote?.message}
            {...resolveForm.register('learningNote')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button type="button" variant="outline" onClick={() => setResolveTargetIssue(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              isLoading={resolveForm.formState.isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit for Guide Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
