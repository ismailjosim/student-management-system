import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface TagProps {
  label: string;
  variant?: TagVariant;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

export function Tag({ label, variant = 'default', removable, onRemove, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {label}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
