import React from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-bold text-gray-700 ml-1">
            {label}
          </label>
        )}
        <input
          className={cn(
            'flex w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground',
            error ? 'border-destructive focus:ring-destructive' : 'hover:border-accent',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs font-bold text-destructive ml-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground ml-1 italic">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

/* --- Textarea --- */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-bold text-foreground ml-1">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground',
            error ? 'border-destructive focus:ring-destructive' : 'hover:border-accent',
            className
          )}

          ref={ref}
          {...props}
        />
        {error && <p className="text-xs font-bold text-destructive ml-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground ml-1 italic">{helperText}</p>
        )}
      </div>
    );
  }
);


Textarea.displayName = 'Textarea';
