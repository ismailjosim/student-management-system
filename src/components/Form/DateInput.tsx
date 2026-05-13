import * as React from 'react';
import { cn } from '@/lib/cn';

function DateInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type="date"
      className={cn(
        'h-8 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        className
      )}
      {...props}
    />
  );
}

export { DateInput };
