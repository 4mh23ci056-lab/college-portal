import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ text?: string; className?: string }> = ({
  text = 'Loading information...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-[#C6A15B] mb-2" />
      <p className="text-xs font-medium text-[#536482]">{text}</p>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-[#DDD0B6] bg-[#FCFAF6]/60 ${className}`}
    >
      {icon && <div className="p-3 bg-[#FAF5E8] text-[#C6A15B] rounded-full mb-3">{icon}</div>}
      <h4 className="text-sm font-semibold text-[#17243B] mb-1">{title}</h4>
      <p className="text-xs text-[#536482] max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
