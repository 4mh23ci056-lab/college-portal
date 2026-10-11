import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#17243B] mb-1.5">
            {label} {props.required && <span className="text-[#8B1E1E]">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#536482]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-lg border bg-[#FDFAF5] py-2 text-sm text-[#17243B] placeholder:text-[#8FA8CE]/80 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B] focus:border-[#C6A15B] ${
              leftIcon ? 'pl-9 pr-3' : 'px-3'
            } ${
              error
                ? 'border-[#8B1E1E] focus:ring-[#8B1E1E] focus:border-[#8B1E1E]'
                : 'border-[#DDD0B6] hover:border-[#C6A15B]'
            } disabled:bg-[#EBE1CF]/30 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-[#8B1E1E] font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#536482]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[#17243B] mb-1.5">
            {label} {props.required && <span className="text-[#8B1E1E]">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={props.rows || 3}
          className={`block w-full rounded-lg border bg-[#FDFAF5] p-3 text-sm text-[#17243B] placeholder:text-[#8FA8CE]/80 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B] focus:border-[#C6A15B] ${
            error
              ? 'border-[#8B1E1E] focus:ring-[#8B1E1E] focus:border-[#8B1E1E]'
              : 'border-[#DDD0B6] hover:border-[#C6A15B]'
          } disabled:bg-[#EBE1CF]/30 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-[#8B1E1E] font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#536482]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[#17243B] mb-1.5">
            {label} {props.required && <span className="text-[#8B1E1E]">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-lg border bg-[#FDFAF5] px-3 py-2 text-sm text-[#17243B] transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B] focus:border-[#C6A15B] ${
            error
              ? 'border-[#8B1E1E] focus:ring-[#8B1E1E] focus:border-[#8B1E1E]'
              : 'border-[#DDD0B6] hover:border-[#C6A15B]'
          } disabled:bg-[#EBE1CF]/30 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-[#8B1E1E] font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#536482]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
