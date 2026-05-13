import * as React from 'react';
import { cn } from '@/lib/cn';

function FileInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type="file"
      className={cn(
        'h-8 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm file:inline-flex file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1 file:rounded-md file:text-xs file:font-medium file:cursor-pointer placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { FileInput };
