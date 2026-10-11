import React, { useEffect, useState } from 'react';
import { evaluationService } from '../../services/evaluationService';
import { projectService } from '../../services/projectService';
import { FeedbackResolutionItem, Project } from '../../types';
import { PageHeader, Alert } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Textarea } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Clock,
  FileCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const FeedbackTrackerPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackResolutionItem[]>([]);
  const [verifyTargetItem, setVerifyTargetItem] = useState<FeedbackResolutionItem | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbackItems();
  }, []);

  const loadFeedbackItems = async () => {
    setLoading(true);
    try {
      const projects = await projectService.getProjects();
      const primary = projects[0];
      setProject(primary);
      if (primary) {
        const list = await evaluationService.getFeedbackItemsByProject(primary.id);
        setFeedbackItems(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDecision = async (
    status: 'GUIDE_VERIFIED' | 'FURTHER_CORRECTION_REQUIRED'
  ) => {
    if (!verifyTargetItem || !verificationNote.trim()) {
      alert('Please enter supervisory verification notes before recording decision.');
      return;
    }
    try {
      await evaluationService.guideVerifyFeedback(verifyTargetItem.id, {
        status,
        guideVerificationNote: verificationNote,
      });

      setVerifyTargetItem(null);
      setVerificationNote('');
      setNotice(`Verification logged: Action item updated to ${status.replace(/_/g, ' ')}`);
      setTimeout(() => setNotice(null), 4000);
      await loadFeedbackItems();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving feedback remediation pipeline..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Resolution Tracker"
        description="Closed-loop verification pipeline: Feedback → Action → Student Correction → Evidence → Guide Verification"
        badge={
          <Badge variant="navy" size="sm" dot>
            {feedbackItems.filter((f) => f.status === 'GUIDE_VERIFIED').length} of {feedbackItems.length} Resolved
          </Badge>
        }
      />

      {notice && (
        <Alert variant="success" title="Status Updated">
          {notice}
        </Alert>
      )}

      {/* Tracker Pipeline Flow Cards */}
      <div className="space-y-4">
        {feedbackItems.map((item, idx) => (
          <Card key={item.id} className="border-l-4 border-l-[#C6A15B]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-bold text-[#C6A15B] uppercase tracking-wider">
                  Remediation Item #{idx + 1}
                </span>
                <h4 className="text-sm font-bold text-[#17243B] mt-0.5">{item.requiredAction}</h4>
                <p className="text-xs text-[#536482] mt-0.5">
                  <strong>Triggering Guide Feedback:</strong> "{item.feedbackReceived}"
                </p>
              </div>

              <div className="shrink-0">
                <Badge
                  variant={
                    item.status === 'GUIDE_VERIFIED'
                      ? 'success'
                      : item.status === 'STUDENT_SUBMITTED'
                      ? 'gold'
                      : item.status === 'FURTHER_CORRECTION_REQUIRED'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                  dot
                >
                  {item.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Pipeline Step Sequence Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 p-3 bg-[#FAF5E8] rounded-xl border border-[#E6D09A] text-xs">
              <div>
                <span className="font-bold text-[#17243B] block mb-0.5">1. Student Correction</span>
                <p className="text-[#536482] leading-snug">
                  {item.studentCorrection || 'Pending student submission...'}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#17243B] block mb-0.5">2. Evidence Attached</span>
                {item.evidenceSubmissionName ? (
                  <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    {item.evidenceSubmissionName}
                  </span>
                ) : (
                  <span className="text-[#8FA8CE] italic">No document attached</span>
                )}
              </div>

              <div>
                <span className="font-bold text-[#17243B] block mb-0.5">3. Guide Verification</span>
                <p className="text-[#536482] leading-snug">
                  {item.guideVerificationNote || 'Awaiting guide sign-off'}
                </p>
              </div>
            </div>

            {/* Actions for Guide */}
            <div className="pt-2 border-t border-[#EFE8D8] flex items-center justify-between">
              <span className="text-xs text-[#536482]">Last Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>

              {item.status !== 'GUIDE_VERIFIED' && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    setVerifyTargetItem(item);
                    setVerificationNote('Verified implementation during laboratory demonstration.');
                  }}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Verify Correction
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* VERIFY CORRECTION MODAL */}
      <Modal
        isOpen={!!verifyTargetItem}
        onClose={() => setVerifyTargetItem(null)}
        title="Supervisory Verification Sign-Off"
        subtitle={`Action: ${verifyTargetItem?.requiredAction}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#FAF5E8] border border-[#E6D09A] text-xs text-[#17243B]">
            <p className="font-bold">Student's Submitted Work:</p>
            <p className="mt-1 text-[#536482]">{verifyTargetItem?.studentCorrection}</p>
            {verifyTargetItem?.evidenceSubmissionName && (
              <p className="mt-1 font-semibold text-[#2E7D32]">
                Evidence File: {verifyTargetItem.evidenceSubmissionName}
              </p>
            )}
          </div>

          <Textarea
            label="Faculty Guide Verification Remarks"
            rows={3}
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
            required
            helperText="Provide institutional remarks for student's thesis archive"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleVerifyDecision('FURTHER_CORRECTION_REQUIRED')}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Request Further Correction
            </Button>

            <Button
              type="button"
              variant="gold"
              onClick={() => handleVerifyDecision('GUIDE_VERIFIED')}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Approve &amp; Verify Resolved
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
