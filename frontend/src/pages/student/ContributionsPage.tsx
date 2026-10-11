import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { contributionService } from '../../services/contributionService';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { Contribution, Task, Project } from '../../types';
import { PageHeader, Alert } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  Users,
  Plus,
  FileCheck,
  Calendar,
  Info,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

const contributionSchema = z.object({
  taskId: z.string().min(1, 'Please select related milestone task'),
  description: z.string().min(15, 'Description must be at least 15 characters'),
  workCompleted: z.string().min(20, 'Specific work completed details required'),
  supportingEvidenceName: z.string().min(3, 'Provide evidence document name or PR link'),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

export const ContributionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
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
        const [tList, cList] = await Promise.all([
          taskService.getTasksByProject(primary.id),
          contributionService.getContributionsByProject(primary.id),
        ]);
        setTasks(tList);
        setContributions(cList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (data: ContributionFormData) => {
    if (!project) return;
    try {
      const selectedTask = tasks.find((t) => t.id === data.taskId);
      await contributionService.submitContribution({
        projectId: project.id,
        studentId: 'user-student-1',
        studentName: 'Sinchana Rao',
        taskId: data.taskId,
        taskTitle: selectedTask?.title,
        description: data.description,
        workCompleted: data.workCompleted,
        supportingEvidenceName: data.supportingEvidenceName,
      });

      setIsModalOpen(false);
      reset();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving team contribution telemetry..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contribution Tracking Module"
        description="Transparent record of individual student efforts, evidence submissions, and guide verification logs"
        actions={
          <Button
            variant="gold"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record Contribution
          </Button>
        }
      />

      {/* Institutional Policy Notice */}
      <Alert variant="info" title="Institutional Policy: Contribution & Evaluation Protocol">
        Please note that logged contributions constitute verifiable qualitative evidence for the
        assigned project guide. They do not represent automatic marks or score allocation until
        formally assessed during scheduled milestone reviews.
      </Alert>

      {/* Contribution Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CardHeader
            title="Team Contribution Timeline"
            subtitle={`${contributions.length} validated activity submissions`}
          />

          <div className="space-y-4">
            {contributions.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-[#C6A15B]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#17243B]">{item.description}</h4>
                    {item.taskTitle && (
                      <span className="text-xs text-[#C6A15B] font-semibold">
                        Milestone: {item.taskTitle}
                      </span>
                    )}
                  </div>
                  <Badge variant={item.guideReviewed ? 'success' : 'ivory'} size="sm">
                    {item.guideReviewed ? 'Guide Verified' : 'Pending Guide Review'}
                  </Badge>
                </div>

                <div className="bg-[#FAF5E8] p-3 rounded-lg border border-[#E6D09A] my-3">
                  <p className="text-xs font-semibold text-[#17243B] mb-0.5">Work Completed:</p>
                  <p className="text-xs text-[#536482] leading-relaxed">{item.workCompleted}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-[#536482] pt-2 border-t border-[#EFE8D8]">
                  <div className="flex items-center gap-3">
                    <span>Contributor: <strong>{item.studentName}</strong></span>
                    <span>Date: <strong>{item.submissionDate}</strong></span>
                  </div>
                  {item.supportingEvidenceName && (
                    <span className="font-medium text-[#17243B] flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
                      {item.supportingEvidenceName}
                    </span>
                  )}
                </div>

                {item.guideRemarks && (
                  <div className="mt-3 p-2.5 rounded-lg bg-[#EBF5EE] border border-[#C8E6C9] text-xs text-[#1B5E20]">
                    <strong>Guide Remarks:</strong> {item.guideRemarks}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Member Contribution Breakdown */}
        <div>
          <Card>
            <CardHeader
              title="Individual Effort Distribution"
              subtitle="Logged work submissions per student"
            />
            <div className="space-y-4">
              {project?.teamMembers.map((member) => {
                const memberContribs = contributions.filter(
                  (c) => c.studentName.includes(member.name.split(' ')[0])
                );
                return (
                  <div key={member.id} className="p-3 rounded-xl bg-[#FDFAF5] border border-[#DDD0B6]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[#17243B]">{member.name}</span>
                      <span className="text-xs font-extrabold text-[#C6A15B]">
                        {memberContribs.length} logs
                      </span>
                    </div>
                    <p className="text-[11px] text-[#536482] mb-2">{member.roleInTeam}</p>
                    <div className="w-full bg-[#EBE1CF] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#C6A15B] h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (memberContribs.length / Math.max(1, contributions.length)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* RECORD CONTRIBUTION MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Project Contribution"
        subtitle="Submit qualitative work log and associated proof of completion"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(handleAddContribution)} className="space-y-4">
          <Select
            label="Related Milestone Task"
            error={errors.taskId?.message}
            {...register('taskId')}
          >
            <option value="">Select task...</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>

          <Input
            label="Contribution Summary"
            placeholder="e.g. Quantized PyTorch weights to FP16 with ONNX runtime"
            error={errors.description?.message}
            {...register('description')}
          />

          <Textarea
            label="Specific Work Completed & Methodology"
            rows={4}
            placeholder="Describe the steps performed, algorithms implemented, unit tests validated, or components soldered..."
            error={errors.workCompleted?.message}
            {...register('workCompleted')}
          />

          <Input
            label="Supporting Evidence Reference (File or Git PR)"
            placeholder="e.g. TensorRT_Quantization_PR4.pdf or Commit 7b84f3"
            error={errors.supportingEvidenceName?.message}
            {...register('supportingEvidenceName')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Submit Contribution Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
