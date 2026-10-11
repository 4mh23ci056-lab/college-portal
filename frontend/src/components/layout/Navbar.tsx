import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, UserCheck, Shield, BookOpen, User, Bell } from 'lucide-react';
import { Role } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, role, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole: Role) => {
    switchRole(newRole);
    if (newRole === 'STUDENT') navigate('/student');
    else if (newRole === 'GUIDE') navigate('/guide');
    else if (newRole === 'ADMIN') navigate('/admin');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#FAF5E8] border-b border-[#E6DCB8] shadow-xs">
      {/* Left: Mobile Toggle & Page context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-[#17243B] hover:bg-[#EBE1CF] rounded-lg md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-[#C6A15B] uppercase tracking-wider">
            Academic Year 2025-2026
          </p>
          <h2 className="text-sm font-extrabold text-[#17243B]">
            {user?.department || 'Department of Computer Science & Engineering'}
          </h2>
        </div>
      </div>

      {/* Right: Quick Role Switcher for Testing + User badge */}
      <div className="flex items-center gap-3">
        {/* Instant Role Preview Switcher */}
        <div className="flex items-center bg-[#EBE1CF]/80 p-1 rounded-xl border border-[#DDD0B6]">
          <span className="text-[10px] font-bold text-[#536482] uppercase px-2 hidden lg:inline">
            Role Switch:
          </span>
          <button
            onClick={() => handleRoleChange('STUDENT')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              role === 'STUDENT'
                ? 'bg-[#17243B] text-[#F6F0E5] shadow-xs'
                : 'text-[#17243B] hover:bg-white/60'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Student</span>
          </button>
          <button
            onClick={() => handleRoleChange('GUIDE')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              role === 'GUIDE'
                ? 'bg-[#17243B] text-[#F6F0E5] shadow-xs'
                : 'text-[#17243B] hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Guide</span>
          </button>
          <button
            onClick={() => handleRoleChange('ADMIN')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              role === 'ADMIN'
                ? 'bg-[#17243B] text-[#F6F0E5] shadow-xs'
                : 'text-[#17243B] hover:bg-white/60'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>

        {/* Notification indicator */}
        <div className="relative">
          <button
            type="button"
            className="p-2 text-[#17243B] hover:bg-[#EBE1CF] rounded-lg transition-colors"
            title="System notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C6A15B]" />
          </button>
        </div>
      </div>
    </header>
  );
};
