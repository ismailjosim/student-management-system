'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/cn';

export function ThemeToggler() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      suppressHydrationWarning
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-full border border-border bg-secondary p-1 transition-all duration-300',
        'hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        isDark && 'bg-primary shadow-[0_0_14px_rgba(251,113,133,0.32)]'
      )}
    >
      <span
        suppressHydrationWarning
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform duration-300',
          isDark && 'translate-x-6 text-primary'
        )}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </button>
  );
}
