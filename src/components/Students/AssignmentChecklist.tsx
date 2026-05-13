import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Assignment } from '@/interfaces/assignment.interface';
import { cn } from '@/lib/cn';

interface AssignmentChecklistProps {
  assignments: Assignment[];
  studentId: string;
}

const TOTAL = 10;

export function AssignmentChecklist({
  assignments,
  studentId: _studentId,
}: AssignmentChecklistProps) {
  // Build a map for quick lookup
  const assignmentMap = new Map(assignments.map((a) => [a.assignmentNumber, a]));

  const completed = assignments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'SUBMITTED'
  ).length;
  const pct = Math.round((completed / TOTAL) * 100);

  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Course Progress</h3>
          <span className="text-sm font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {completed} of {TOTAL} assignments done
        </p>
      </div>

      <div className="divide-y divide-border">
        {Array.from({ length: TOTAL }, (_, i) => {
          const num = i + 1;
          const a = assignmentMap.get(num);
          const isDone = a?.status === 'COMPLETED' || a?.status === 'SUBMITTED';
          const isPending = a?.status === 'PENDING';

          return (
            <div
              key={num}
              className={cn(
                'flex items-center justify-between px-5 py-3 text-sm transition-colors',
                isDone ? 'bg-green-50/50' : 'hover:bg-muted/20'
              )}
            >
              <div className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                ) : isPending ? (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span className={cn('font-medium', isDone && 'text-green-800')}>
                  Assignment {String(num).padStart(2, '0')}
                </span>
              </div>
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded',
                  isDone
                    ? 'bg-green-100 text-green-700'
                    : isPending
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {isDone
                  ? a?.status === 'SUBMITTED'
                    ? 'Submitted'
                    : 'Done'
                  : isPending
                    ? 'Pending'
                    : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
