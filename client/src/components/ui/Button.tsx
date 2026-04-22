import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-brand-hover shadow-lg shadow-brand/10 ring-ring focus:ring-ring',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 ring-offset-background focus:ring-ring',
    outline: 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground ring-offset-background focus:ring-ring',
    ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground ring-offset-background focus:ring-ring',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 ring-offset-background focus:ring-ring',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};


export default Button;
