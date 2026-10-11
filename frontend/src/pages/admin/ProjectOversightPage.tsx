import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { projectService } from '../../services/projectService';
import { Project, User } from '../../types';
import { PageHeader, ProgressBar } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  FolderGit2,
  Sliders,
  UserCheck,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const ProjectOversightPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [guides, setGuides] = useState<User[]>([]);
  const [reassignTargetProject, setReassignTargetProject] = useState<Project | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, uList] = await Promise.all([
        projectService.getProjects(),
        adminService.getUsers(),
      ]);
      setProjects(pList);
      const guideList = uList.filter((u) => u.role === 'GUIDE');
      setGuides(guideList);
      if (guideList.length > 0) setSelectedGuideId(guideList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReassignGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTargetProject || !selectedGuideId) return;

    try {
      await adminService.assignGuideToProject(reassignTargetProject.id, selectedGuideId);
      const chosenGuide = guides.find((g) => g.id === selectedGuideId);
      setNotice(`Guide allocation updated: ${chosenGuide?.name} assigned to ${reassignTargetProject.code}`);
      setReassignTargetProject(null);
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading departmental projects and faculty allocations..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Oversight &amp; Guide Allocation"
        description="Departmental project roster, faculty guide assignments, workload distribution, and milestone compliance"
      />

      {notice && (
        <div className="p-4 rounded-xl border border-[#C8E6C9] bg-[#EBF5EE] text-xs text-[#1B5E20] font-semibold">
          {notice}
        </div>
      )}

      {/* Projects List with Guide Reassignment */}
      <div className="space-y-4">
        {projects.map((proj) => (
          <Card key={proj.id} className="border-l-4 border-l-[#C6A15B]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#C6A15B]">{proj.code}</span>
                  <span className="text-xs text-[#536482]">• {proj.department}</span>
                  <span className="text-xs text-[#536482]">• Academic Year: {proj.academicYear}</span>
                </div>
                <h3 className="text-base font-bold text-[#17243B]">{proj.title}</h3>
                <p className="text-xs text-[#536482] mt-0.5 max-w-3xl">{proj.description}</p>
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
                <span className="block text-xs font-bold text-[#17243B] mt-1">
                  {proj.progressPercentage}% Completed
                </span>
              </div>
            </div>

            {/* Guide & Team Allocation Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 p-3 rounded-lg bg-[#FAF5E8] border border-[#E6D09A] text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#536482] block">
                    Assigned Faculty Guide:
                  </span>
                  <span className="font-bold text-[#17243B] text-sm">{proj.guideName}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReassignTargetProject(proj);
                    setSelectedGuideId(proj.guideId || guides[0]?.id || '');
                  }}
                  leftIcon={<Sliders className="w-3.5 h-3.5" />}
                >
                  Reassign Guide
                </Button>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#536482] block mb-1">
                  Enrolled Students ({proj.teamMembers.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proj.teamMembers.map((m) => (
                    <span
                      key={m.id}
                      className="px-2 py-0.5 rounded bg-white border border-[#DDD0B6] text-[11px] font-medium text-[#17243B]"
                    >
                      {m.name} ({m.enrollmentNumber})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ProgressBar value={proj.progressPercentage} showLabel={false} color="gold" size="sm" />
          </Card>
        ))}
      </div>

      {/* REASSIGN GUIDE MODAL */}
      <Modal
        isOpen={!!reassignTargetProject}
        onClose={() => setReassignTargetProject(null)}
        title="Reassign Faculty Project Guide"
        subtitle={`Project: ${reassignTargetProject?.code} - ${reassignTargetProject?.title}`}
        maxWidth="md"
      >
        <form onSubmit={handleReassignGuide} className="space-y-4">
          <Select
            label="Select Faculty Guide"
            value={selectedGuideId}
            onChange={(e) => setSelectedGuideId(e.target.value)}
          >
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.department})
              </option>
            ))}
          </Select>

          <p className="text-xs text-[#536482]">
            Reassigning the guide transfers all pending proposal reviews, milestone evaluations, and feedback verification duties to the selected faculty member.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReassignTargetProject(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" leftIcon={<UserCheck className="w-4 h-4" />}>
              Confirm Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
