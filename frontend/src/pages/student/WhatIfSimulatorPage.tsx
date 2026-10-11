import React, { useEffect, useState } from 'react';
import { taskService } from '../../services/taskService';
import { projectService, SimulationResult } from '../../services/projectService';
import { Task, Project } from '../../types';
import { PageHeader, Alert } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select, Input } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  Clock,
  AlertTriangle,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const WhatIfSimulatorPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [hypotheticalDelay, setHypotheticalDelay] = useState<number>(10);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

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
        if (tList.length > 0) {
          setSelectedTaskId(tList[2]?.id || tList[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedTaskId) return;
    try {
      const res = await projectService.simulateDeadlineDelay(selectedTaskId, hypotheticalDelay);
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Initializing schedule dependency simulator engine..." />;
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deadline What-If Simulator"
        description="Predictive cascade analysis of upstream milestone delays on downstream dependencies and final project viva schedule"
        badge={
          <Badge variant="navy" size="sm" dot>
            Predictive Model Engine
          </Badge>
        }
      />

      {/* Strict Institutional Sandbox Guarantee */}
      <Alert variant="warning" title="Non-Destructive Simulation Guarantee">
        This simulation engine runs purely in volatile sandbox memory. It computes the downstream
        topological shift across dependency graphs. <strong>Actual project deadlines, academic milestones, and database schedules will never be modified.</strong>
      </Alert>

      {/* Simulator Control Panel */}
      <Card>
        <CardHeader
          title="Configure Hypothetical Delay Scenario"
          subtitle="Choose an active milestone and test schedule elasticity"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div className="md:col-span-2">
            <Select
              label="Select Upstream Milestone Task to Delay"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} (Deadline: {task.proposedDeadline}) [{task.importance}]
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Input
              label="Hypothetical Delay (Calendar Days)"
              type="number"
              min={1}
              max={60}
              value={hypotheticalDelay}
              onChange={(e) => setHypotheticalDelay(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[#EFE8D8] flex items-center justify-between">
          <p className="text-xs text-[#536482]">
            Target Task Dependencies:{' '}
            <strong>
              {tasks.filter((t) => t.dependencies.includes(selectedTaskId)).length} direct downstream tasks
            </strong>
          </p>

          <Button
            variant="gold"
            onClick={runSimulation}
            leftIcon={<Clock className="w-4 h-4" />}
          >
            Compute Cascade Impact
          </Button>
        </div>
      </Card>

      {/* Simulation Results Display */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Summary Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-[#C6A15B]">
              <span className="text-[10px] uppercase font-bold text-[#536482]">Simulated Milestone</span>
              <h4 className="text-sm font-bold text-[#17243B] mt-1 truncate">
                {simulationResult.simulatedTaskTitle}
              </h4>
              <p className="text-xs text-[#C6A15B] font-extrabold mt-2">
                +{simulationResult.delayDays} Days Induced Delay
              </p>
            </Card>

            <Card className="border-t-4 border-t-[#17243B]">
              <span className="text-[10px] uppercase font-bold text-[#536482]">Downstream Tasks Affected</span>
              <h4 className="text-2xl font-black text-[#17243B] mt-1">
                {simulationResult.affectedTasks.length} Tasks
              </h4>
              <p className="text-xs text-[#536482] mt-1">
                {simulationResult.affectedTasks.length > 0
                  ? 'Cascading shift triggered along dependency chain'
                  : 'Isolated leaf task: no downstream dependents affected'}
              </p>
            </Card>

            <Card className={`border-t-4 ${simulationResult.criticalPathImpact ? 'border-t-rose-600' : 'border-t-[#2E7D32]'}`}>
              <span className="text-[10px] uppercase font-bold text-[#536482]">Projected Final Submission</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs line-through text-[#536482]">{simulationResult.originalProjectEndDate}</span>
                <span className="text-base font-black text-rose-700">
                  ↳ {simulationResult.projectedNewEndDate}
                </span>
              </div>
              <p className="text-xs font-bold text-rose-600 mt-1">
                Project delivery shifted by +{simulationResult.totalScheduleShiftDays} days
              </p>
            </Card>
          </div>

          {/* Cascaded Tasks Breakdown Table */}
          <Card>
            <CardHeader
              title="Downstream Dependency Impact Topology"
              subtitle="Calculated shift on successor tasks caused by the simulated delay"
            />

            {simulationResult.affectedTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF5E8] border-b border-[#E6DCB8] text-[#17243B] font-bold">
                      <th className="p-3">Dependent Task</th>
                      <th className="p-3">Assigned Team Member</th>
                      <th className="p-3">Original Deadline</th>
                      <th className="p-3">Simulated New Deadline</th>
                      <th className="p-3">Schedule Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8D8]">
                    {simulationResult.affectedTasks.map((task) => (
                      <tr key={task.taskId} className="hover:bg-[#FDFAF5]">
                        <td className="p-3 font-bold text-[#17243B] flex items-center gap-2">
                          <GitBranch className="w-3.5 h-3.5 text-[#C6A15B]" />
                          {task.taskTitle}
                        </td>
                        <td className="p-3 text-[#536482]">{task.assignedToName}</td>
                        <td className="p-3 text-[#536482]">{task.originalDeadline}</td>
                        <td className="p-3 font-bold text-rose-700">{task.projectedNewDeadline}</td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                            +{task.daysShifted} Days
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#536482] bg-[#FAF5E8] rounded-xl border border-[#E6D09A]">
                No downstream dependent tasks rely on this milestone. The delay does not cause cascading schedule slippage.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
