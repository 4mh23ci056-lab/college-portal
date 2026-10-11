# ProTrack — College Project Monitoring & Improvement Portal

A production-quality institutional academic dashboard built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**.

---

## 1. Design System & Color Palette
The portal adheres to the strict 3-primary color scheme:
- **Ivory (`#F6F0E5`)**: Academic canvas background, subtle cards, and surfaces.
- **Gold (`#C6A15B`)**: Primary action buttons, active navigation indicators, and progress highlights.
- **Deep Navy (`#17243B`)**: Persistent academic sidebar, high-contrast typography, and primary headers.

Typography: **Plus Jakarta Sans** with **Cinzel** academic serif headers. Clean cards, accessible contrast ratios, and keyboard navigation support (`focus-visible`).

---

## 2. Supported Roles & Workflows

### 🎓 1. Student Portal (`/student`)
- **Executive Dashboard**: Overall progress, pending vs overdue tasks, guide evaluation score trajectories (with Recharts), unresolved issues, and real-time health indicator (`ON_TRACK`, `AT_RISK`, `CRITICAL`).
- **Project Proposal Module (`/student/proposal`)**: Full proposal drafting, pre-submission missing sections checklist, guide remarks, revision versioning, and resubmission.
- **Task & Milestone Management (`/student/tasks`)**: Task creation, team assignment, dependency mapping (`depends on Task #X`), importance levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), table/card/timeline views, and evidence deliverable uploads.
- **Contribution Tracking (`/student/contributions`)**: Transparent student work logging, task links, and proof-of-work attachments with clear institutional disclaimer (*evidence for guide review, not automatic marks*).
- **Issue & Root Cause Tracker (`/student/issues`)**: Defect and obstacle diagnosis, identified cause, corrective action, resolution proof, and institutional learning notes.
- **Deadline What-If Simulator (`/student/simulator`)**: Non-destructive predictive delay simulator computing downstream cascading schedule impacts without altering actual project deadlines.
- **Project Improvement Report (`/student/improvement-report`)**: Longitudinal multi-phase score progression (e.g. Design 4 → 7, Implementation 5 → 8, Testing 4 → 7), major improvements, addressed weaknesses, and exportable dossier.
- **Final Submission (`/student/final-submission`)**: Final dissertation upload, Git repository URL, demonstration screencast, and viva readiness checklist.

---

### 👨‍🏫 2. Faculty Guide Portal (`/guide`)
- **Guide Dashboard**: Supervised student cohorts, pending proposal reviews, pending correction verifications, unresolved issues, and attention alerts for at-risk cohorts.
- **Assigned Teams (`/guide/projects`)**: Deep dive into student team rosters, milestone completion velocity, and uploaded deliverable files.
- **Proposal Review (`/guide/proposals`)**: Written feedback, approve proposals, or request modifications with version tracking.
- **Evaluation & Scores (`/guide/evaluations`)**: Multi-criteria scoring on **Design**, **Implementation**, and **Testing** criteria (scores 0–10) with automatic score trend tracking (`IMPROVING`, `DECLINING`, `UNCHANGED`) without overwriting previous reviews.
- **Feedback Resolution Tracker (`/guide/feedback-tracker`)**: Closed-loop verification pipeline: Feedback Received → Required Action → Student Correction → Evidence Attached → Guide Sign-off.
- **Issue & Work Verification (`/guide/issues`)**: Verify student root cause diagnoses and evaluate logged contributions.

---

### 🏛️ 3. Academic Directorate / Admin Portal (`/admin`)
- **System Overview (`/admin`)**: Institution-wide metrics, total students/guides, department project distribution, and health breakdowns.
- **User Management (`/admin/users`)**: Provision students and guides, edit roles, filter by department or role.
- **Project Oversight & Guide Allocation (`/admin/projects`)**: Reassign and allocate faculty guides to department projects.
- **Security Audit Logs (`/admin/audit-logs`)**: Immutable audit trail of user logins, proposal status changes, evaluation submissions, and role alterations with timestamps, IP addresses, and categories.

---

## 3. Technology Stack
- **Framework**: React 19 + TypeScript (Vite 8)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom theme tokens
- **Routing**: React Router v7
- **API Client**: Axios with Bearer token authentication and interceptors
- **Data Visualization**: Recharts (LineChart, BarChart, PieChart)
- **Icons**: Lucide React
- **Validation**: React Hook Form + Zod

---

## 4. Setup and Run Instructions

### Prerequisites
- Node.js (v18+ recommended, tested on v24)
- npm (v9+)

### Installation
```bash
cd frontend
npm install
```

### Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="ProTrack College Project Portal"
```

### Run Locally (Development)
```bash
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### Build Production Bundle
```bash
npm run build
```

---

## 5. API Service Layer Architecture
All backend communication is isolated inside `src/services/`:
- `api.ts`: Base Axios instance with automatic JWT header attachment, timeout configuration, and resilience fallback.
- `authService.ts`: Login, token handling, session persistence.
- `projectService.ts`: Project data, deadline what-if simulation, and final submission.
- `proposalService.ts`: Proposal drafts, submissions, revisions, and guide review.
- `taskService.ts`: Tasks CRUD, dependencies, progress synchronization, and evidence upload.
- `contributionService.ts`: Evidence logging and guide reviews.
- `issueService.ts`: Issue reporting, root cause diagnosis, and guide verification.
- `evaluationService.ts`: Criteria scoring, multi-round history, and feedback resolution tracking.
- `adminService.ts`: User provisioning, guide allocations, and security audit logs.
