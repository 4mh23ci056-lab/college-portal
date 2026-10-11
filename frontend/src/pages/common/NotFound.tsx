import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { GraduationCap, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F0E5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#17243B] text-[#C6A15B] flex items-center justify-center shadow-md mb-4">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-[#17243B] font-serif">404</h1>
      <h2 className="text-lg font-bold text-[#17243B] mt-1">Academic Resource Not Found</h2>
      <p className="text-xs text-[#536482] mt-2 max-w-sm">
        The requested portal page, project record, or evaluation dossier does not exist in the institutional directory.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="gold" leftIcon={<Home className="w-4 h-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
