import React from 'react';

export type BadgeVariant =
  | 'gold'
  | 'navy'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ivory';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gold',
  children,
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    gold: {
      bg: 'bg-[#FAF3E3]',
      text: 'text-[#7A5B22]',
      dotColor: 'bg-[#C6A15B]',
      border: 'border-[#E6D09A]',
    },
    navy: {
      bg: 'bg-[#17243B]',
      text: 'text-[#F6F0E5]',
      dotColor: 'bg-[#C6A15B]',
      border: 'border-[#223454]',
    },
    success: {
      bg: 'bg-[#EBF5EE]',
      text: 'text-[#1B5E20]',
      dotColor: 'bg-[#2E7D32]',
      border: 'border-[#C8E6C9]',
    },
    warning: {
      bg: 'bg-[#FFF8E1]',
      text: 'text-[#8D6E00]',
      dotColor: 'bg-[#FBC02D]',
      border: 'border-[#FFE082]',
    },
    danger: {
      bg: 'bg-[#FDEDEC]',
      text: 'text-[#900C3F]',
      dotColor: 'bg-[#C70039]',
      border: 'border-[#F5B7B1]',
    },
    ivory: {
      bg: 'bg-[#EBE1CF]',
      text: 'text-[#17243B]',
      dotColor: 'bg-[#17243B]',
      border: 'border-[#DDD0B6]',
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />}
      {children}
    </span>
  );
};
