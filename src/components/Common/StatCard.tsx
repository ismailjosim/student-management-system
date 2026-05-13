import React from 'react';
import { cn } from '@/lib/cn';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  className,
  valueClassName,
}: StatCardProps) {
  const trendColor =
    change?.trend === 'up'
      ? 'text-green-600'
      : change?.trend === 'down'
        ? 'text-red-600'
        : 'text-gray-600';

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('text-2xl font-bold text-foreground mt-2', valueClassName)}>{value}</p>
          {change && (
            <p className={cn('text-xs font-medium mt-2', trendColor)}>
              {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '→'}{' '}
              {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {Icon && <Icon className="w-8 h-8 text-muted-foreground shrink-0" />}
      </div>
    </div>
  );
}
