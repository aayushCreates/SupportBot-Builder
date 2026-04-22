import React from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'ready' | 'training' | 'error' | 'untrained' | 'neutral' | 'blue';
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', ...props }) => {
  const variants = {
    ready: 'bg-green-50 text-green-700 border-green-100',
    training: 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse',
    error: 'bg-red-50 text-red-700 border-red-100',
    untrained: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    neutral: 'bg-gray-50 text-gray-700 border-gray-100',
    blue: 'bg-blue-600 text-white border-transparent shadow-sm shadow-blue-100',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export default Badge;
