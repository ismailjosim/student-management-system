import React from 'react';
import { cn } from '@/lib/cn';

interface MainContentProps {
  children?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
  padding?: boolean;
}

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
};

export function MainContent({
  children,
  className,
  maxWidth = '7xl',
  padding = true,
}: MainContentProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        padding && 'px-4 lg:px-8 py-6',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
