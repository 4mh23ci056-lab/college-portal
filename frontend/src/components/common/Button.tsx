import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'navy' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    gold: 'bg-[#C6A15B] text-[#17243B] hover:bg-[#B58F49] active:bg-[#A37E38] font-semibold shadow-xs focus:ring-[#C6A15B]',
    navy: 'bg-[#17243B] text-[#F6F0E5] hover:bg-[#233452] active:bg-[#10192A] focus:ring-[#17243B]',
    outline:
      'border border-[#C6A15B] text-[#17243B] bg-transparent hover:bg-[#EBE1CF]/50 active:bg-[#EBE1CF] focus:ring-[#C6A15B]',
    ghost:
      'text-[#17243B] hover:bg-[#EBE1CF]/60 active:bg-[#EBE1CF] focus:ring-[#C6A15B]',
    danger:
      'bg-[#8B1E1E] text-[#F6F0E5] hover:bg-[#731919] active:bg-[#5C1414] focus:ring-[#8B1E1E]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
