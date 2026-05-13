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
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-purple-100 text-purple-700',
  C: 'bg-green-100 text-green-700',
  D: 'bg-amber-100 text-amber-700',
  E: 'bg-red-100 text-red-700',
  F: 'bg-pink-100 text-pink-700',
  G: 'bg-indigo-100 text-indigo-700',
  H: 'bg-teal-100 text-teal-700',
  I: 'bg-cyan-100 text-cyan-700',
  J: 'bg-orange-100 text-orange-700',
  K: 'bg-lime-100 text-lime-700',
  L: 'bg-emerald-100 text-emerald-700',
  M: 'bg-violet-100 text-violet-700',
  N: 'bg-sky-100 text-sky-700',
  O: 'bg-rose-100 text-rose-700',
  P: 'bg-fuchsia-100 text-fuchsia-700',
  Q: 'bg-blue-100 text-blue-700',
  R: 'bg-amber-100 text-amber-700',
  S: 'bg-green-100 text-green-700',
  T: 'bg-purple-100 text-purple-700',
  U: 'bg-red-100 text-red-700',
  V: 'bg-indigo-100 text-indigo-700',
  W: 'bg-teal-100 text-teal-700',
  X: 'bg-cyan-100 text-cyan-700',
  Y: 'bg-pink-100 text-pink-700',
  Z: 'bg-orange-100 text-orange-700',
};

export function StudentAvatar({ name, size = 'md', className }: StudentAvatarProps) {
  const initials = getInitials(name);
  const firstLetter = initials[0]?.toUpperCase() ?? 'A';
  const colorClass = colorMap[firstLetter] ?? 'bg-gray-100 text-gray-700';

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
