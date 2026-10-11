import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-[#F0F4F9]',
      border: 'border-[#BDCDE5]',
      text: 'text-[#1D3050]',
      icon: <Info className="w-5 h-5 text-[#355685] shrink-0" />,
    },
    success: {
      bg: 'bg-[#EBF5EE]',
      border: 'border-[#C8E6C9]',
      text: 'text-[#1B5E20]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />,
    },
    warning: {
      bg: 'bg-[#FFF8E1]',
      border: 'border-[#FFE082]',
      text: 'text-[#7A5B22]',
      icon: <AlertTriangle className="w-5 h-5 text-[#C6A15B] shrink-0" />,
    },
    danger: {
      bg: 'bg-[#FDEDEC]',
      border: 'border-[#F5B7B1]',
      text: 'text-[#900C3F]',
      icon: <AlertCircle className="w-5 h-5 text-[#C70039] shrink-0" />,
    },
  };

  const style = styles[variant];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border} ${style.text} ${className}`}>
      {style.icon}
      <div className="text-xs">
        {title && <h5 className="font-bold text-sm mb-0.5">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: 'gold' | 'navy' | 'success' | 'danger';
  className?: string;
  size?: 'sm' | 'md';
}> = ({ value, max = 100, showLabel = true, color = 'gold', className = '', size = 'md' }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorClasses = {
    gold: 'bg-[#C6A15B]',
    navy: 'bg-[#17243B]',
    success: 'bg-[#2E7D32]',
    danger: 'bg-[#C70039]',
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1 text-[#17243B]">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-[#EBE1CF] rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#E6DCB8] rounded-xl p-5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#536482] uppercase tracking-wider">{title}</p>
        <div className="p-2.5 rounded-lg bg-[#FAF5E8] text-[#C6A15B]">{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-[#17243B]">{value}</span>
        {trend && trendValue && (
          <span
            className={`flex items-center text-xs font-semibold ${
              trend === 'up'
                ? 'text-[#2E7D32]'
                : trend === 'down'
                ? 'text-[#C70039]'
                : 'text-[#536482]'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : trend === 'down' ? (
              <ArrowDownRight className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {trendValue}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[#536482] mt-1">{subtitle}</p>}
    </div>
  );
};

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, description, badge, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E6DCB8]">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[#17243B] tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-[#536482] mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
