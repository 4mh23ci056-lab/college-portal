import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  ClipboardCheck,
  ShieldCheck,
  Sliders,
  History,
  LogOut,
  FolderGit2,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student', label: 'Project Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/student/proposal', label: 'Project Proposal', icon: <FileText className="w-4 h-4" /> },
    { to: '/student/tasks', label: 'Tasks & Deliverables', icon: <CheckSquare className="w-4 h-4" /> },
    { to: '/student/contributions', label: 'Contribution Tracking', icon: <Users className="w-4 h-4" /> },
    { to: '/student/issues', label: 'Issue Management', icon: <AlertTriangle className="w-4 h-4" /> },
    { to: '/student/simulator', label: 'Deadline Simulator', icon: <Clock className="w-4 h-4" /> },
    { to: '/student/improvement-report', label: 'Improvement Report', icon: <TrendingUp className="w-4 h-4" /> },
    { to: '/student/final-submission', label: 'Final Submission', icon: <Award className="w-4 h-4" /> },
  ];

  const guideLinks = [
    { to: '/guide', label: 'Guide Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/guide/projects', label: 'Assigned Teams', icon: <FolderGit2 className="w-4 h-4" /> },
    { to: '/guide/proposals', label: 'Review Proposals', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/guide/evaluations', label: 'Evaluation & Scores', icon: <ClipboardCheck className="w-4 h-4" /> },
    { to: '/guide/feedback-tracker', label: 'Feedback Tracker', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/guide/issues', label: 'Verify Issues & Work', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { to: '/admin', label: 'System Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/projects', label: 'Project Oversight', icon: <Sliders className="w-4 h-4" /> },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: <History className="w-4 h-4" /> },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'GUIDE' ? guideLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0F1726]/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#17243B] text-[#F6F0E5] flex flex-col justify-between border-r border-[#223454] transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Portal Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[#223454]">
            <div className="w-10 h-10 rounded-xl bg-[#C6A15B] flex items-center justify-center text-[#17243B] font-serif font-black text-xl shadow-md shrink-0">
              P
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-extrabold tracking-tight text-[#F6F0E5] font-serif leading-none">
                PROTRACK
              </h2>
              <span className="text-[10px] text-[#C6A15B] tracking-wider uppercase font-semibold">
                Project Monitoring Portal
              </span>
            </div>
          </div>

          {/* Current Role Banner */}
          <div className="mx-4 mt-4 p-3 rounded-lg bg-[#223454]/60 border border-[#2D456E] flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#17243B] text-[#C6A15B]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#8FA8CE] uppercase font-bold tracking-wider">Active Role</p>
              <p className="text-xs font-bold text-[#F6F0E5] truncate">{role || 'GUEST'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#8FA8CE] mb-2">
              Menu Navigation
            </p>
            <nav className="space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/student' || link.to === '/guide' || link.to === '/admin'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#C6A15B] text-[#17243B] font-bold shadow-xs'
                        : 'text-[#F6F0E5] hover:bg-[#223454] hover:text-white'
                    }`
                  }
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-[#223454] bg-[#10192A]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#C6A15B] text-[#17243B] font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#F6F0E5] truncate">{user?.name || 'Academic User'}</p>
              <p className="text-[10px] text-[#8FA8CE] truncate">{user?.email || 'user@college.edu'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#F6F0E5] bg-[#223454] hover:bg-rose-900/60 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
