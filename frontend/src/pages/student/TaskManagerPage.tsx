import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { Task, Project, TaskImportance, TaskStatus } from '../../types';
import { PageHeader, ProgressBar } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  Plus,
  Upload,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Table as TableIcon,
  GitBranch,
  FileCheck,
  User,
  Trash2,
  ExternalLink,
} from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assignedToName: z.string().min(2, 'Assignee name required'),
  proposedDeadline: z.string().min(6, 'Deadline date required'),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  dependencyId: z.string().optional(),
  estimatedDays: z.coerce.number().min(1).max(90),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const TaskManagerPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'timeline'>('cards');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [uploadTaskTarget, setUploadTaskTarget] = useState<Task | null>(null);

  // Evidence upload form state
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      importance: 'MEDIUM',
      status: 'NOT_STARTED',
      estimatedDays: 14,
    },
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getProjects();
      const primary = projects[0];
      setProject(primary);
      if (primary) {
        const list = await taskService.getTasksByProject(primary.id);
        setTasks(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskFormData) => {
    if (!project) return;
    try {
      const dependencies = data.dependencyId && data.dependencyId !== 'none' ? [data.dependencyId] : [];
      const assignedUser = project.teamMembers.find((m) => m.name === data.assignedToName) || project.teamMembers[0];

      await taskService.createTask({
        projectId: project.id,
        title: data.title,
        description: data.description,
        assignedToId: assignedUser.id,
        assignedToName: data.assignedToName,
        proposedDeadline: data.proposedDeadline,
        dependencies,
        importance: data.importance as TaskImportance,
        status: data.status as TaskStatus,
        estimatedDays: data.estimatedDays,
      });

      setIsCreateModalOpen(false);
      reset();
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        await loadTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTaskTarget || !evidenceTitle.trim()) return;

    try {
      await taskService.uploadEvidence(uploadTaskTarget.id, {
        title: evidenceTitle,
        fileName: evidenceFileName || `${evidenceTitle.replace(/\s+/g, '_')}.pdf`,
        uploaderName: 'Sinchana Rao (Student Lead)',
      });
      setUploadTaskTarget(null);
      setEvidenceTitle('');
      setEvidenceFileName('');
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving project tasks and dependency topology..." />;
  }

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project & Task Management"
        description="Structured milestone breakdown, team assignment, dependency tracking, and deliverable verification"
        actions={
          <Button
            variant="gold"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Task
          </Button>
        }
      />

      {/* Progress & Quick Stats Card */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#17243B]">
              Overall Task Completion ({completedCount}/{tasks.length} Completed)
            </span>
            <span className="text-xs font-bold text-[#C6A15B]">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} showLabel={false} color="gold" />
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF5E8] p-1 rounded-xl border border-[#DDD0B6] shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'cards' ? 'bg-[#17243B] text-[#F6F0E5]' : 'text-[#536482] hover:bg-white/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'table' ? 'bg-[#17243B] text-[#F6F0E5]' : 'text-[#536482] hover:bg-white/60'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Table
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'timeline' ? 'bg-[#17243B] text-[#F6F0E5]' : 'text-[#536482] hover:bg-white/60'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Timeline &amp; Dependencies
          </button>
        </div>
      </Card>

      {/* 1. CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => {
            const dependencyTask = tasks.find((t) => task.dependencies.includes(t.id));
            return (
              <Card
                key={task.id}
                className={`flex flex-col justify-between border-t-4 ${
                  task.importance === 'CRITICAL'
                    ? 'border-t-rose-600'
                    : task.importance === 'HIGH'
                    ? 'border-t-[#C6A15B]'
                    : 'border-t-[#536482]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.importance === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : task.importance === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.importance}
                    </span>

                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-[11px] font-bold border border-[#DDD0B6] rounded-md px-2 py-1 bg-white text-[#17243B] focus:ring-[#C6A15B]"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <h3 className="text-sm font-bold text-[#17243B] mb-1.5">{task.title}</h3>
                  <p className="text-xs text-[#536482] mb-3 line-clamp-2">{task.description}</p>

                  <div className="space-y-1.5 text-[11px] text-[#536482] mb-3 pb-3 border-b border-[#EFE8D8]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-[#C6A15B]" />
                      <span>{task.assignedToName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#C6A15B]" />
                      <span>Deadline: {task.proposedDeadline}</span>
                      {task.isOverdue && (
                        <span className="text-[10px] font-bold text-rose-700 ml-1">(! OVERDUE)</span>
                      )}
                    </div>
                    {dependencyTask && (
                      <div className="flex items-center gap-1.5 text-[#7A5B22]">
                        <GitBranch className="w-3 h-3" />
                        <span>Depends on: {dependencyTask.title.slice(0, 25)}...</span>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Evidence Chips */}
                  {task.evidence.length > 0 && (
                    <div className="mb-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#536482]">Deliverables:</span>
                      {task.evidence.map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between p-1.5 rounded bg-[#FAF5E8] text-[11px] border border-[#E6D09A]"
                        >
                          <span className="truncate font-medium text-[#17243B]">{ev.title}</span>
                          <span className="text-[10px] font-bold text-[#2E7D32]">Uploaded</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadTaskTarget(task)}
                    leftIcon={<Upload className="w-3 h-3" />}
                  >
                    Upload Evidence
                  </Button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-[#536482] hover:text-rose-700 rounded transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 2. TABLE VIEW */}
      {viewMode === 'table' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF5E8] border-b border-[#E6DCB8] text-[#17243B] font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Task Title</th>
                <th className="p-3.5">Assigned To</th>
                <th className="p-3.5">Importance</th>
                <th className="p-3.5">Deadline</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Deliverables</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8D8]">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#FDFAF5] transition-colors">
                  <td className="p-3.5 font-bold text-[#17243B] max-w-xs">{task.title}</td>
                  <td className="p-3.5 text-[#536482]">{task.assignedToName}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.importance === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : task.importance === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.importance}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={task.isOverdue ? 'text-rose-700 font-bold' : 'text-[#17243B]'}>
                      {task.proposedDeadline}
                    </span>
                  </td>
                  <td className="p-3.5">
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
                  </td>
                  <td className="p-3.5 text-[#536482]">{task.evidence.length} uploaded</td>
                  <td className="p-3.5 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadTaskTarget(task)}
                      leftIcon={<Upload className="w-3 h-3" />}
                    >
                      Evidence
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* 3. TIMELINE & DEPENDENCY VIEW */}
      {viewMode === 'timeline' && (
        <Card>
          <CardHeader
            title="Sequential Dependency & Critical Path Timeline"
            subtitle="Visual progression mapping predecessor and successor milestone tasks"
          />

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#C6A15B]">
            {tasks.map((task, idx) => {
              const depTask = tasks.find((t) => task.dependencies.includes(t.id));
              return (
                <div key={task.id} className="relative">
                  <span
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      task.status === 'COMPLETED'
                        ? 'bg-[#2E7D32] text-white'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-[#C6A15B] text-[#17243B]'
                        : 'bg-[#DDD0B6] text-[#536482]'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="bg-[#FDFAF5] p-4 rounded-xl border border-[#E6DCB8]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#17243B]">{task.title}</h4>
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
                    </div>

                    <p className="text-xs text-[#536482] mb-2">{task.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#536482]">
                      <span>Assigned: <strong>{task.assignedToName}</strong></span>
                      <span>Deadline: <strong>{task.proposedDeadline}</strong></span>
                      <span>Duration: <strong>{task.estimatedDays} days</strong></span>
                      {depTask && (
                        <span className="text-[#C6A15B] font-semibold">
                          ↳ Predecessor: {depTask.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project Task"
        subtitle="Define milestone deliverables, dependency constraints and ownership"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(handleCreateTask)} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Real-time Point Cloud Generation & SLAM"
            error={errors.title?.message}
            {...register('title')}
          />

          <Textarea
            label="Task Description"
            placeholder="Detailed scope, technical requirements, algorithms, and expected deliverable..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Assign to Team Member" {...register('assignedToName')}>
              {project?.teamMembers.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </Select>

            <Input
              label="Proposed Deadline"
              type="date"
              error={errors.proposedDeadline?.message}
              {...register('proposedDeadline')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Task Importance" {...register('importance')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>

            <Select label="Initial Status" {...register('status')}>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>

            <Input
              label="Estimated Days"
              type="number"
              error={errors.estimatedDays?.message}
              {...register('estimatedDays')}
            />
          </div>

          <Select label="Task Dependency (Predecessor)" {...register('dependencyId')}>
            <option value="none">None (Independent Task)</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                Depends on: {t.title}
              </option>
            ))}
          </Select>

          <div className="pt-4 border-t border-[#EFE8D8] flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Add Task to Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* UPLOAD EVIDENCE MODAL */}
      <Modal
        isOpen={!!uploadTaskTarget}
        onClose={() => setUploadTaskTarget(null)}
        title="Upload Deliverable Evidence"
        subtitle={`Task: ${uploadTaskTarget?.title}`}
        maxWidth="md"
      >
        <form onSubmit={handleUploadEvidence} className="space-y-4">
          <Input
            label="Deliverable / Evidence Title"
            placeholder="e.g. Latency Profiling Benchmark Report"
            value={evidenceTitle}
            onChange={(e) => setEvidenceTitle(e.target.value)}
            required
          />

          <Input
            label="Filename or Document ID"
            placeholder="e.g. Jetson_Inference_Benchmark_Report.pdf"
            value={evidenceFileName}
            onChange={(e) => setEvidenceFileName(e.target.value)}
          />

          <div className="border-2 border-dashed border-[#DDD0B6] rounded-xl p-6 text-center bg-[#FDFAF5]">
            <Upload className="w-8 h-8 text-[#C6A15B] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#17243B]">Attach deliverable file</p>
            <p className="text-[10px] text-[#536482]">PDF, DOCX, ZIP, or Jupyter Notebook up to 50MB</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button type="button" variant="outline" onClick={() => setUploadTaskTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" leftIcon={<Upload className="w-4 h-4" />}>
              Submit Evidence
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
