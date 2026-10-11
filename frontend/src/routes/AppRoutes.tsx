import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Auth & Common
import { Login } from '../pages/auth/Login';
import { NotFound } from '../pages/common/NotFound';
import { Unauthorized } from '../pages/common/Unauthorized';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { ProposalPage } from '../pages/student/ProposalPage';
import { TaskManagerPage } from '../pages/student/TaskManagerPage';
import { ContributionsPage } from '../pages/student/ContributionsPage';
import { IssuesPage } from '../pages/student/IssuesPage';
import { WhatIfSimulatorPage } from '../pages/student/WhatIfSimulatorPage';
import { ImprovementReportPage } from '../pages/student/ImprovementReportPage';
import { FinalSubmissionPage } from '../pages/student/FinalSubmissionPage';

// Guide Pages
import { GuideDashboard } from '../pages/guide/GuideDashboard';
import { GuideProjectsPage } from '../pages/guide/GuideProjectsPage';
import { ProposalReviewPage } from '../pages/guide/ProposalReviewPage';
import { EvaluationsPage } from '../pages/guide/EvaluationsPage';
import { FeedbackTrackerPage } from '../pages/guide/FeedbackTrackerPage';
import { GuideIssuesVerificationPage } from '../pages/guide/GuideIssuesVerificationPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { ProjectOversightPage } from '../pages/admin/ProjectOversightPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

export const AppRoutes: React.FC = () => {
  const { role, isAuthenticated } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'STUDENT') return '/student';
    if (role === 'GUIDE') return '/guide';
    if (role === 'ADMIN') return '/admin';
    return '/login';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Root redirect based on role */}
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

      {/* Student Protected Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="proposal" element={<ProposalPage />} />
        <Route path="tasks" element={<TaskManagerPage />} />
        <Route path="contributions" element={<ContributionsPage />} />
        <Route path="issues" element={<IssuesPage />} />
        <Route path="simulator" element={<WhatIfSimulatorPage />} />
        <Route path="improvement-report" element={<ImprovementReportPage />} />
        <Route path="final-submission" element={<FinalSubmissionPage />} />
      </Route>

      {/* Guide Protected Portal */}
      <Route
        path="/guide"
        element={
          <ProtectedRoute allowedRoles={['GUIDE']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GuideDashboard />} />
        <Route path="projects" element={<GuideProjectsPage />} />
        <Route path="proposals" element={<ProposalReviewPage />} />
        <Route path="evaluations" element={<EvaluationsPage />} />
        <Route path="feedback-tracker" element={<FeedbackTrackerPage />} />
        <Route path="issues" element={<GuideIssuesVerificationPage />} />
      </Route>

      {/* Admin Protected Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="projects" element={<ProjectOversightPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
