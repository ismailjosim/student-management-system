import { getInitials } from '@/lib/ui-helpers';
import { cn } from '@/lib/cn';

interface StudentAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
};

const colorMap: Record<string, string> = {
  A: 'status-info',
  B: 'bg-secondary text-secondary-foreground',
  C: 'status-success',
  D: 'status-warning',
  E: 'status-danger',
  F: 'bg-primary/10 text-primary',
  G: 'bg-accent text-accent-foreground',
  H: 'status-info',
  I: 'bg-secondary text-secondary-foreground',
  J: 'status-warning',
  K: 'status-success',
  L: 'status-success',
  M: 'bg-secondary text-secondary-foreground',
  N: 'status-info',
  O: 'bg-primary/10 text-primary',
  P: 'bg-secondary text-secondary-foreground',
  Q: 'status-info',
  R: 'status-warning',
  S: 'status-success',
  T: 'bg-secondary text-secondary-foreground',
  U: 'status-danger',
  V: 'bg-accent text-accent-foreground',
  W: 'status-info',
  X: 'bg-secondary text-secondary-foreground',
  Y: 'bg-primary/10 text-primary',
  Z: 'status-warning',
};

export function StudentAvatar({ name, size = 'md', className }: StudentAvatarProps) {
  const initials = getInitials(name);
  const firstLetter = initials[0]?.toUpperCase() ?? 'A';
  const colorClass = colorMap[firstLetter] ?? 'status-neutral';

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0',
        sizeMap[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
