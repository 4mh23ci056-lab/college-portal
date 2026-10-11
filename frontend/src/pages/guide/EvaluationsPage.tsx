import React, { useEffect, useState } from 'react';
import { evaluationService } from '../../services/evaluationService';
import { projectService } from '../../services/projectService';
import { EvaluationRecord, Project, ScoreTrend } from '../../types';
import { PageHeader, Alert } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  ClipboardCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  User,
  History,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const EvaluationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form states for new review round
  const [roundName, setRoundName] = useState('Phase 3 - Hardware Integration & Field Benchmark');
  const [designScore, setDesignScore] = useState(9);
  const [designFeedback, setDesignFeedback] = useState('Clean modular PCB and telemetry bus architecture.');
  const [implScore, setImplScore] = useState(9);
  const [implFeedback, setImplFeedback] = useState('Sub-14ms TensorRT edge inference demonstrated.');
  const [testingScore, setTestingScore] = useState(8);
  const [testingFeedback, setTestingFeedback] = useState('Rigorous 500-run synthetic Monte Carlo benchmark.');
  const [generalFeedback, setGeneralFeedback] = useState('Outstanding semester progression. Ready for final viva.');
  const [requiredActionText, setRequiredActionText] = useState('Verify kill-switch transmitter battery level prior to final arena run.');

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getProjects();
      const primary = projects[0];
      setProject(primary);
      if (primary) {
        const list = await evaluationService.getEvaluationsByProject(primary.id);
        setEvaluations(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordNewEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    try {
      const criteriaScores = [
        {
          criterion: 'Design',
          score: Number(designScore),
          maxScore: 10,
          weightage: 30,
          feedback: designFeedback,
        },
        {
          criterion: 'Implementation',
          score: Number(implScore),
          maxScore: 10,
          weightage: 40,
          feedback: implFeedback,
        },
        {
          criterion: 'Testing',
          score: Number(testingScore),
          maxScore: 10,
          weightage: 30,
          feedback: testingFeedback,
        },
      ];

      const total = Number(((designScore * 0.3) + (implScore * 0.4) + (testingScore * 0.3)).toFixed(1));
      const requiredActions = requiredActionText.split('\n').map((s) => s.trim()).filter(Boolean);

      await evaluationService.recordEvaluation({
        projectId: project.id,
        reviewRound: evaluations.length + 1,
        reviewRoundName: roundName,
        reviewDate: new Date().toISOString().split('T')[0],
        reviewerId: 'user-guide-1',
        reviewerName: 'Dr. Ramesh Kulkarni (Guide)',
        criteriaScores,
        totalScore: total,
        maxTotalScore: 10,
        generalFeedback,
        requiredActions,
      });

      setIsRecordModalOpen(false);
      await loadEvaluations();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving longitudinal evaluation records..." />;
  }

  // Chart data for trendline
  const chartData = evaluations.map((e) => ({
    name: `Phase ${e.reviewRound}`,
    TotalScore: e.totalScore,
    Design: e.criteriaScores.find((c) => c.criterion === 'Design')?.score || 0,
    Implementation: e.criteriaScores.find((c) => c.criterion === 'Implementation')?.score || 0,
    Testing: e.criteriaScores.find((c) => c.criterion === 'Testing')?.score || 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Milestone Evaluation & Score Trajectory"
        description="Standardized multi-criteria assessment (Design, Implementation, Testing) with longitudinal trend analysis"
        actions={
          <Button
            variant="gold"
            onClick={() => setIsRecordModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record New Evaluation Round
          </Button>
        }
      />

      {/* Recharts Longitudinal Score Trajectory */}
      <Card>
        <CardHeader
          title="Multi-Round Score Trajectory (4 → 7 → 9)"
          subtitle="Persistent historical review archive preserving all assessment cycles without overwriting"
        />

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DCB8" />
              <XAxis dataKey="name" stroke="#536482" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#536482" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FCFAF6', borderColor: '#DDD0B6', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="TotalScore" stroke="#C6A15B" strokeWidth={3} dot={{ r: 6 }} />
              <Line type="monotone" dataKey="Design" stroke="#17243B" strokeWidth={2} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Implementation" stroke="#2E7D32" strokeWidth={2} />
              <Line type="monotone" dataKey="Testing" stroke="#597CAD" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Historical Evaluation Cycles Cards */}
      <div className="space-y-5">
        <h3 className="text-xs font-bold text-[#536482] uppercase tracking-wider">
          Chronological Evaluation Archive ({evaluations.length} Cycles)
        </h3>

        {evaluations.map((item, idx) => {
          const prevItem = idx > 0 ? evaluations[idx - 1] : null;
          return (
            <Card key={item.id} className="border-l-4 border-l-[#C6A15B]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#C6A15B]">Round #{item.reviewRound}</span>
                    <span className="text-xs text-[#536482]">• Evaluator: {item.reviewerName}</span>
                    <span className="text-xs text-[#536482]">• Date: {item.reviewDate}</span>
                  </div>
                  <h4 className="text-base font-bold text-[#17243B]">{item.reviewRoundName}</h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-[#536482]">Composite Score</span>
                    <div className="text-xl font-black text-[#17243B]">
                      {item.totalScore} <span className="text-xs text-[#536482]">/ {item.maxTotalScore}</span>
                    </div>
                  </div>
                  <Badge
                    variant={item.trend === 'IMPROVING' ? 'success' : item.trend === 'DECLINING' ? 'danger' : 'ivory'}
                    size="sm"
                    dot
                  >
                    {item.trend}
                  </Badge>
                </div>
              </div>

              {/* Criteria Scores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
                {item.criteriaScores.map((crit, cIdx) => {
                  const prevCrit = prevItem?.criteriaScores.find((c) => c.criterion === crit.criterion);
                  return (
                    <div key={cIdx} className="p-3 rounded-lg bg-[#FAF5E8] border border-[#E6D09A] text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-[#17243B]">{crit.criterion}</strong>
                        <span className="font-extrabold text-[#C6A15B]">
                          {crit.score} / {crit.maxScore}
                        </span>
                      </div>
                      {prevCrit && (
                        <div className="text-[10px] text-[#536482] mb-1">
                          Previous: {prevCrit.score} → Current: {crit.score}{' '}
                          <span className={crit.score >= prevCrit.score ? 'text-[#2E7D32] font-bold' : 'text-rose-700 font-bold'}>
                            ({crit.score >= prevCrit.score ? '↑ Improving' : '↓ Declining'})
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] text-[#536482] leading-snug italic mt-1">"{crit.feedback}"</p>
                    </div>
                  );
                })}
              </div>

              {/* General Remarks & Action Items */}
              <div className="bg-[#FDFAF5] p-3 rounded-lg border border-[#EFE8D8] text-xs space-y-2">
                <p className="text-[#17243B]">
                  <strong>General Guide Feedback:</strong> {item.generalFeedback}
                </p>
                {item.requiredActions.length > 0 && (
                  <div>
                    <strong className="text-[#7A5B22]">Mandatory Corrective Action Items:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[#536482]">
                      {item.requiredActions.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* RECORD NEW EVALUATION MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Formal Evaluation Round"
        subtitle="Standardized scoring on Design, Implementation and Testing criteria"
        maxWidth="xl"
      >
        <form onSubmit={handleRecordNewEvaluation} className="space-y-4">
          <Input
            label="Evaluation Phase / Review Milestone"
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF5E8] border border-[#E6D09A]">
            <div>
              <Input
                label="Design Score (0-10)"
                type="number"
                min={0}
                max={10}
                value={designScore}
                onChange={(e) => setDesignScore(Number(e.target.value))}
                required
              />
              <Textarea
                label="Design Feedback"
                rows={2}
                value={designFeedback}
                onChange={(e) => setDesignFeedback(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Implementation Score (0-10)"
                type="number"
                min={0}
                max={10}
                value={implScore}
                onChange={(e) => setImplScore(Number(e.target.value))}
                required
              />
              <Textarea
                label="Implementation Feedback"
                rows={2}
                value={implFeedback}
                onChange={(e) => setImplFeedback(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Testing Score (0-10)"
                type="number"
                min={0}
                max={10}
                value={testingScore}
                onChange={(e) => setTestingScore(Number(e.target.value))}
                required
              />
              <Textarea
                label="Testing Feedback"
                rows={2}
                value={testingFeedback}
                onChange={(e) => setTestingFeedback(e.target.value)}
              />
            </div>
          </div>

          <Textarea
            label="General Written Review & Synthesis"
            rows={3}
            value={generalFeedback}
            onChange={(e) => setGeneralFeedback(e.target.value)}
            required
          />

          <Textarea
            label="Required Corrective Action Items (One per line)"
            rows={2}
            value={requiredActionText}
            onChange={(e) => setRequiredActionText(e.target.value)}
            helperText="Each action will automatically trigger a student resolution item in the tracker"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button type="button" variant="outline" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" leftIcon={<ClipboardCheck className="w-4 h-4" />}>
              Record &amp; Publish Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
