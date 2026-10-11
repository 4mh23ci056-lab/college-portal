import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { Project, Task } from '../../types';
import { PageHeader, ProgressBar } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  FolderGit2,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  FileCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const GuideProjectsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await projectService.getProjects();
      setProjects(list);
      if (list.length > 0) {
        setSelectedProject(list[0]);
        const tList = await taskService.getTasksByProject(list[0].id);
        setTasks(tList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (proj: Project) => {
    setSelectedProject(proj);
    try {
      const tList = await taskService.getTasksByProject(proj.id);
      setTasks(tList);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading assigned student teams..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Projects & Teams"
        description="Detailed review of supervised student teams, milestone tasks, deliverable files and evidence"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#536482] uppercase tracking-wider">
            Assigned Cohorts ({projects.length})
          </h3>
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => handleSelectProject(proj)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedProject?.id === proj.id
                  ? 'border-[#C6A15B] bg-white shadow-sm ring-2 ring-[#C6A15B]/30'
                  : 'border-[#E6DCB8] bg-[#FDFAF5] hover:border-[#C6A15B]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#C6A15B]">{proj.code}</span>
                <Badge
                  variant={
                    proj.health === 'ON_TRACK'
                      ? 'success'
                      : proj.health === 'AT_RISK'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {proj.health.replace('_', ' ')}
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-[#17243B] line-clamp-1">{proj.title}</h4>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#536482]">
                <span>{proj.teamMembers.length} Student Members</span>
                <span className="font-extrabold text-[#17243B]">{proj.progressPercentage}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Project Full Details & Task Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject && (
            <>
              <Card>
                <CardHeader
                  title={selectedProject.title}
                  subtitle={`Project Code: ${selectedProject.code} | Department: ${selectedProject.department}`}
                  action={
                    <Badge variant="navy" size="sm">
                      {selectedProject.status.replace(/_/g, ' ')}
                    </Badge>
                  }
                />
                <p className="text-xs text-[#536482] mb-4">{selectedProject.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-[#17243B]">Project Progress</span>
                    <span className="font-extrabold text-[#C6A15B]">
                      {selectedProject.progressPercentage}%
                    </span>
                  </div>
                  <ProgressBar value={selectedProject.progressPercentage} showLabel={false} color="gold" />
                </div>

                {/* Team Members List */}
                <div className="border-t border-[#EFE8D8] pt-4">
                  <h4 className="text-xs font-bold text-[#17243B] mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#C6A15B]" />
                    Registered Team Members
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.teamMembers.map((m) => (
                      <div key={m.id} className="p-3 rounded-lg bg-[#FAF5E8] border border-[#E6D09A] text-xs">
                        <div className="font-bold text-[#17243B]">{m.name}</div>
                        <div className="text-[11px] text-[#536482]">{m.enrollmentNumber} • {m.email}</div>
                        <div className="text-[11px] text-[#C6A15B] font-semibold mt-1">{m.roleInTeam}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Tasks & Deliverable Verification */}
              <Card>
                <CardHeader
                  title="Milestone Tasks & Deliverable Evidence"
                  subtitle="Verify uploaded files, test plots and reports submitted by students"
                />

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-[#E6DCB8] bg-[#FDFAF5]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-[#17243B]">{task.title}</h4>
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

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#536482] mb-2">
                        <span>Assigned: <strong>{task.assignedToName}</strong></span>
                        <span>Deadline: <strong>{task.proposedDeadline}</strong></span>
                        <span>Priority: <strong>{task.importance}</strong></span>
                      </div>

                      {/* Evidence Files */}
                      {task.evidence.length > 0 ? (
                        <div className="mt-2 p-2.5 rounded-lg bg-white border border-[#EFE8D8] space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-[#536482]">
                            Uploaded Proof of Work:
                          </span>
                          {task.evidence.map((ev) => (
                            <div
                              key={ev.id}
                              className="flex items-center justify-between text-xs text-[#17243B]"
                            >
                              <span className="flex items-center gap-1.5">
                                <FileCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                                <strong>{ev.title}</strong> ({ev.fileName})
                              </span>
                              <span className="text-[10px] text-[#536482]">
                                Uploaded: {ev.uploadedAt}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#8FA8CE] italic">
                          No deliverable evidence uploaded yet for this milestone.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
