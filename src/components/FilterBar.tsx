import React from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    label: string;
    key: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  onReset: () => void;
  className?: string;
}

export function FilterBar({ filters, onReset, className }: FilterBarProps) {
  const hasActiveFilters = filters.some((f) => f.value);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-2">
            <label htmlFor={filter.key} className="text-xs font-medium text-muted-foreground">
              {filter.label}:
            </label>
            <select
              id={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-8 px-2 rounded-md border border-input bg-background text-xs text-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 h-8 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
