import React from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

interface CardBodyProps {
  children?: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children?: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, title, subtitle, action }: CardHeaderProps) {
  return (
    <div
      className={cn('border-b border-border px-6 py-4 flex items-start justify-between', className)}
    >
      <div className="flex-1">
        {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'border-t border-border px-6 py-4 flex items-center justify-between bg-muted/30',
        className
      )}
    >
      {children}
    </div>
  );
}
