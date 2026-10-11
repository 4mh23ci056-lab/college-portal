import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { role } = useAuth();
  const defaultPath = role === 'STUDENT' ? '/student' : role === 'GUIDE' ? '/guide' : '/admin';

  return (
    <div className="min-h-screen bg-[#F6F0E5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#8B1E1E] text-white flex items-center justify-center shadow-md mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-[#17243B] font-serif">403 Forbidden</h1>
      <h2 className="text-lg font-bold text-[#17243B] mt-1">Access Restricted by Role Policy</h2>
      <p className="text-xs text-[#536482] mt-2 max-w-sm">
        Your current institutional role (<strong>{role || 'UNKNOWN'}</strong>) does not hold authorization to access this faculty or administrative section.
      </p>
      <div className="mt-6">
        <Link to={defaultPath}>
          <Button variant="gold" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Authorized Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
