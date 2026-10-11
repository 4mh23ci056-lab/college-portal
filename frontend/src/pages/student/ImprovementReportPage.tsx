import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/projectService';
import { evaluationService } from '../../services/evaluationService';
import { issueService } from '../../services/issueService';
import { taskService } from '../../services/taskService';
import {
  Project,
  EvaluationRecord,
  ProjectIssue,
  FeedbackResolutionItem,
  Task,
} from '../../types';
import { PageHeader } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  Printer,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ImprovementReportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackResolutionItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

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
        const [eList, iList, fList, tList] = await Promise.all([
          evaluationService.getEvaluationsByProject(primary.id),
          issueService.getIssuesByProject(primary.id),
          evaluationService.getFeedbackItemsByProject(primary.id),
          taskService.getTasksByProject(primary.id),
        ]);
        setEvaluations(eList);
        setIssues(iList);
        setFeedbackItems(fList);
        setTasks(tList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Generating consolidated improvement dossier..." />;
  }

  const initialEval = evaluations[0];
  const finalEval = evaluations[evaluations.length - 1];

  const criteriaComparison = [
    {
      criterion: 'Design & Architecture',
      initial: initialEval?.criteriaScores.find((c) => c.criterion === 'Design')?.score || 4,
      final: finalEval?.criteriaScores.find((c) => c.criterion === 'Design')?.score || 7,
      max: 10,
    },
    {
      criterion: 'Implementation & Engineering',
      initial: initialEval?.criteriaScores.find((c) => c.criterion === 'Implementation')?.score || 5,
      final: finalEval?.criteriaScores.find((c) => c.criterion === 'Implementation')?.score || 8,
      max: 10,
    },
    {
      criterion: 'Testing & Verification',
      initial: initialEval?.criteriaScores.find((c) => c.criterion === 'Testing')?.score || 4,
      final: finalEval?.criteriaScores.find((c) => c.criterion === 'Testing')?.score || 7,
      max: 10,
    },
  ];

  const comparisonChartData = criteriaComparison.map((c) => ({
    name: c.criterion.split(' ')[0],
    'Phase 1 (Initial)': c.initial,
    'Phase 2 (Current)': c.final,
  }));

  const resolvedIssues = issues.filter((i) => i.status === 'GUIDE_VERIFIED' || i.status === 'CLOSED');
  const verifiedFeedback = feedbackItems.filter((f) => f.status === 'GUIDE_VERIFIED');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Improvement & Evaluation Report"
        description="Comprehensive institutional longitudinal analysis of student growth, addressed weaknesses, and milestone progression"
        actions={
          <Button
            variant="navy"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Export / Print Report
          </Button>
        }
      />

      {/* Institutional Document Header */}
      <Card className="bg-white border-2 border-[#17243B] p-6 shadow-sm">
        <div className="border-b-2 border-[#C6A15B] pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A15B]">
              Academic Department of Computer Science &amp; Engineering
            </span>
            <h2 className="text-xl font-black text-[#17243B] font-serif">{project?.title}</h2>
            <p className="text-xs text-[#536482]">
              Project Code: <strong>{project?.code}</strong> | Academic Year: <strong>2025-2026</strong>
            </p>
          </div>

          <div className="text-right shrink-0">
            <Badge variant="success" size="md">
              Status: {project?.status.replace(/_/g, ' ')}
            </Badge>
            <p className="text-[11px] text-[#536482] mt-1">Project Guide: {project?.guideName}</p>
          </div>
        </div>

        {/* 1. INITIAL VS FINAL EVALUATION MATRIX */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#17243B] uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C6A15B]" />
            1. Longitudinal Evaluation Progression (Initial vs Latest Phase)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {criteriaComparison.map((item, idx) => {
              const delta = item.final - item.initial;
              return (
                <div key={idx} className="p-4 rounded-xl bg-[#FDFAF5] border border-[#E6DCB8]">
                  <span className="text-xs font-bold text-[#536482]">{item.criterion}</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#536482]">{item.initial}</span>
                      <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
                      <span className="text-2xl font-black text-[#17243B]">{item.final}</span>
                      <span className="text-xs text-[#536482]">/ {item.max}</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#2E7D32] bg-[#EBF5EE] px-2 py-0.5 rounded">
                      +{delta} pts
                    </span>
                  </div>
                  <div className="w-full bg-[#EBE1CF] h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-[#C6A15B] h-1.5 rounded-full"
                      style={{ width: `${(item.final / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recharts Comparison Chart */}
          <div className="h-64 w-full bg-[#FCFAF6] p-4 rounded-xl border border-[#DDD0B6]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DCB8" />
                <XAxis dataKey="name" stroke="#536482" fontSize={12} />
                <YAxis domain={[0, 10]} stroke="#536482" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FCFAF6', borderColor: '#DDD0B6', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Phase 1 (Initial)" fill="#BDCDE5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Phase 2 (Current)" fill="#C6A15B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. MAJOR IMPROVEMENTS ACROSS PHASES */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#17243B] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            2. Major Architectural &amp; Engineering Improvements
          </h3>
          <div className="space-y-2.5">
            {[
              {
                title: 'High-Level Architecture to Formal MAVLink Protocol Specification',
                detail: 'Transformed abstract block diagram into rigorous UART Interface Control Document (ICD) with CRC checksum and heartbeat verification.',
              },
              {
                title: 'Synthetic Sensor Noise Calibration with Physical IMU Data',
                detail: 'Profiled Bosch BMI088 noise spectral density and Allan Variance; calibrated AirSim simulator to accurately mirror real quadcopter physics.',
              },
              {
                title: 'FP16 / INT8 TensorRT Graph Quantization on Jetson Orin Nano',
                detail: 'Optimized neural policy model graph from 58ms PyTorch inference down to 13.8ms sub-frame real-time execution latency.',
              },
            ].map((imp, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-[#FAF5E8] border border-[#E6D09A] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#17243B]">{imp.title}</h4>
                  <p className="text-xs text-[#536482] mt-0.5 leading-relaxed">{imp.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RECURRING WEAKNESSES IDENTIFIED & STATUS */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#17243B] uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C6A15B]" />
            3. Weaknesses Flagged &amp; Mitigation Trajectory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF5E8] border-b border-[#E6DCB8] text-[#17243B] font-bold">
                  <th className="p-3">Identified Weakness</th>
                  <th className="p-3">Phase Flagged</th>
                  <th className="p-3">Corrective Engineering Action</th>
                  <th className="p-3">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8D8]">
                <tr>
                  <td className="p-3 font-semibold text-[#17243B]">Unrealistic sensor noise in simulation</td>
                  <td className="p-3 text-[#536482]">Phase 1</td>
                  <td className="p-3 text-[#536482]">Calibrated Allan Variance with physical sensor telemetry</td>
                  <td className="p-3">
                    <Badge variant="success" size="sm">Resolved (Guide Verified)</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#17243B]">GPU Out-of-Memory crashes under depth feed</td>
                  <td className="p-3 text-[#536482]">Phase 2</td>
                  <td className="p-3 text-[#536482]">Implemented zero-copy DMA memory buffers in OpenCV GStreamer</td>
                  <td className="p-3">
                    <Badge variant="success" size="sm">Resolved (Guide Verified)</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#17243B]">Thermal throttling under continuous inference</td>
                  <td className="p-3 text-[#536482]">Phase 2</td>
                  <td className="p-3 text-[#536482]">Profiled 30-min stress run; GPU stabilized at 62°C</td>
                  <td className="p-3">
                    <Badge variant="gold" size="sm">Correction Submitted</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. FEEDBACK & ISSUE STATISTICS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#EFE8D8]">
          <div className="p-4 rounded-xl bg-[#FDFAF5] border border-[#DDD0B6]">
            <h4 className="text-xs font-bold text-[#17243B] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
              Feedback Resolution Statistics
            </h4>
            <div className="space-y-1.5 text-xs text-[#536482]">
              <div className="flex justify-between">
                <span>Total Guide Feedback Actions:</span>
                <strong>{feedbackItems.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Verified Resolved:</span>
                <strong className="text-[#2E7D32]">{verifiedFeedback.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Resolution Success Rate:</span>
                <strong className="text-[#17243B]">
                  {feedbackItems.length > 0 ? Math.round((verifiedFeedback.length / feedbackItems.length) * 100) : 0}%
                </strong>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FDFAF5] border border-[#DDD0B6]">
            <h4 className="text-xs font-bold text-[#17243B] mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#C6A15B]" />
              Issue &amp; Root Cause Statistics
            </h4>
            <div className="space-y-1.5 text-xs text-[#536482]">
              <div className="flex justify-between">
                <span>Total Obstacles Logged:</span>
                <strong>{issues.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Guide-Verified Resolutions:</span>
                <strong className="text-[#2E7D32]">{resolvedIssues.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Institutional Learning Rate:</span>
                <strong className="text-[#17243B]">100% with documented learnings</strong>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
