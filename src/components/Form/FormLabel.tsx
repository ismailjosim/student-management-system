import React from 'react';
import { cn } from '@/lib/cn';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ className, children, required, ...props }: FormLabelProps) {
  return (
    <label className={cn('text-sm font-medium text-foreground block', className)} {...props}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return <p className={cn('text-xs text-destructive mt-1', className)}>{message}</p>;
}
