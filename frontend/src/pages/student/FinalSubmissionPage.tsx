import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { Project, Task } from '../../types';
import { PageHeader, Alert } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  Award,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Code2,
  Video,
} from 'lucide-react';


const finalSubmissionSchema = z.object({
  reportUrl: z.string().min(3, 'Dissertation report document required'),
  repositoryUrl: z.string().url('Valid Git repository URL required'),
  videoDemoUrl: z.string().url('Valid demonstration video URL required'),
  abstractSummary: z.string().min(40, 'Final abstract must be at least 40 characters'),
  plagiarismConsent: z.boolean().refine((val) => val === true, 'Institutional anti-plagiarism consent required'),
});

type FinalSubmissionFormData = z.infer<typeof finalSubmissionSchema>;

export const FinalSubmissionPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FinalSubmissionFormData>({
    resolver: zodResolver(finalSubmissionSchema),
    defaultValues: {
      reportUrl: 'Autonomous_Drone_Navigation_Final_Thesis_2026.pdf',
      repositoryUrl: 'https://github.com/sinchanarao/deep-rl-autonomous-drone',
      videoDemoUrl: 'https://youtube.com/watch?v=drone-disaster-mapping-demo',
      abstractSummary:
        'A complete deep reinforcement learning navigation system deployed on Jetson Orin Nano for GPS-denied disaster search and rescue operations, achieving 13.8ms inference latency and 97.4% collision clearance.',
      plagiarismConsent: true,
    },
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
        const tList = await taskService.getTasksByProject(primary.id);
        setTasks(tList);
        if (primary.status === 'COMPLETED') {
          setSubmitted(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FinalSubmissionFormData) => {
    if (!project) return;
    try {
      const updated = await projectService.submitFinalProject(project.id, {
        reportUrl: data.reportUrl,
        repositoryUrl: data.repositoryUrl,
        notes: data.abstractSummary,
      });
      setProject(updated);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving final project compliance checklist..." />;
  }

  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Final Project Submission & Viva Dossier"
        description="Formal semester conclusion, code repository archiving, dissertation upload, and viva examination readiness"
        badge={
          project && (
            <Badge variant={submitted ? 'success' : 'gold'} size="sm" dot>
              {submitted ? 'Final Submission Accepted' : 'Ready for Submission'}
            </Badge>
          )
        }
      />

      {submitted ? (
        <Card className="border-2 border-[#2E7D32] bg-[#FCFAF6] text-center p-8">
          <div className="w-16 h-16 rounded-full bg-[#EBF5EE] text-[#2E7D32] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-[#17243B] font-serif">
            Final Dissertation &amp; Deliverables Successfully Archived
          </h2>
          <p className="text-xs text-[#536482] mt-2 max-w-xl mx-auto">
            Your final dissertation, GitHub source code repository, and demonstration telemetry have been formally logged into the Academic Project Repository. You are cleared for the final viva examination committee.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/student/improvement-report">
              <Button variant="gold" size="sm">
                View Improvement Dossier
              </Button>
            </a>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Submission Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Final Project Deliverables Dossier"
                subtitle="Provide permanent institutional repository links and documentation"
              />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Final Dissertation Document (Institutional PDF)"
                  placeholder="e.g. Autonomous_Drone_Final_Report.pdf"
                  leftIcon={<FileText className="w-4 h-4" />}
                  error={errors.reportUrl?.message}
                  {...register('reportUrl')}
                />

                <Input
                  label="Version-Controlled Source Code Repository URL"
                  placeholder="https://github.com/institution/project"
                  leftIcon={<Code2 className="w-4 h-4" />}
                  error={errors.repositoryUrl?.message}

                  {...register('repositoryUrl')}
                />

                <Input
                  label="Demonstration Video or Screencast URL"
                  placeholder="https://youtube.com/watch?v=..."
                  leftIcon={<Video className="w-4 h-4" />}
                  error={errors.videoDemoUrl?.message}
                  {...register('videoDemoUrl')}
                />

                <Textarea
                  label="Consolidated Final Abstract & Technical Summary"
                  rows={4}
                  placeholder="Summarize the core technical contribution, novel methodology, validation results, and benchmarks..."
                  error={errors.abstractSummary?.message}
                  {...register('abstractSummary')}
                />

                <div className="p-4 rounded-xl bg-[#FAF5E8] border border-[#E6D09A]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-[#DDD0B6] text-[#C6A15B] focus:ring-[#C6A15B]"
                      {...register('plagiarismConsent')}
                    />
                    <div className="text-xs text-[#17243B]">
                      <strong>Institutional Ethics &amp; Anti-Plagiarism Certification</strong>
                      <p className="text-[#536482] mt-0.5">
                        I hereby declare that this project represents original academic work conducted under the guidance of Dr. Ramesh Kulkarni. All literature citations, code dependencies, and datasets have been properly acknowledged.
                      </p>
                    </div>
                  </label>
                  {errors.plagiarismConsent && (
                    <p className="text-xs text-[#8B1E1E] mt-2 font-bold">
                      {errors.plagiarismConsent.message}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#EFE8D8] flex items-center justify-between">
                  <span className="text-xs text-[#536482]">
                    Milestone Tasks: <strong>{completedTasksCount} of {tasks.length} Completed</strong>
                  </span>

                  <Button
                    type="submit"
                    variant="gold"
                    isLoading={isSubmitting}
                    leftIcon={<Award className="w-4 h-4" />}
                  >
                    Submit Final Project
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Checklist Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Viva Readiness Checklist"
                subtitle="Prerequisites before viva examination clearance"
              />

              <div className="space-y-2.5">
                {[
                  { label: 'Project Proposal Approved by Guide', checked: true },
                  { label: 'All Milestone Tasks Completed', checked: completedTasksCount >= 4 },
                  { label: 'Phase 1 & 2 Evaluations Recorded', checked: true },
                  { label: 'Feedback Resolutions Verified', checked: true },
                  { label: 'Clean Anti-Plagiarism Check (< 15%)', checked: true },
                  { label: 'Guide Pre-Viva Clearance', checked: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[#E6DCB8] bg-[#FDFAF5] text-xs"
                  >
                    <span className="font-semibold text-[#17243B]">{item.label}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
