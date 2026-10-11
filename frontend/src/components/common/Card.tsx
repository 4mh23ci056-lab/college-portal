import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E6DCB8] rounded-xl p-5 shadow-xs transition-shadow ${
        hoverEffect ? 'hover:shadow-md hover:border-[#C6A15B] cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-[#EFE8D8] mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-[#17243B]">{title}</h3>
        {subtitle && <p className="text-xs text-[#536482] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
