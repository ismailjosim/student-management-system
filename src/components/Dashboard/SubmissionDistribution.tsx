import type { StudentWithRelations } from '@/types';
import { getLastAssignmentNumber } from '@/lib/ui-helpers';

interface SubmissionDistributionProps {
  students: StudentWithRelations[];
}

export function SubmissionDistribution({ students }: SubmissionDistributionProps) {
  // Count how many students completed each assignment (1–10)
  const distribution = Array.from(
    { length: 10 },
    (_, i) => students.filter((s) => getLastAssignmentNumber(s.lastCompletedAssignment) > i).length
  );

  const total = students.length || 1;
  const max = Math.max(...distribution, 1);

  const completionPercentages = distribution.map((count) => Math.round((count / total) * 100));

  return (
    <div className="bg-background rounded-xl border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Assignment Submission Overview
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {total} students total • Showing completion by assignment
        </p>
      </div>
      <div className="p-6">
        <div className="flex items-end justify-between gap-1.5 h-48">
          {distribution.map((count, i) => {
            const heightPct = (count / max) * 100;
            const pct = completionPercentages[i];
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-1.5 group">
                <span className="text-[11px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {count} ({pct}%)
                </span>
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary/60 hover:from-primary/90 hover:to-primary/50 rounded-t transition-colors relative"
                  style={{ height: `${Math.max(heightPct, 5)}%` }}
                  title={`A${i + 1}: ${count} students (${pct}%)`}
                />
                <span className="text-[10px] text-muted-foreground font-semibold">
                  A-{String(i + 1).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground font-medium mb-1">Total Students</p>
            <p className="text-xl font-bold">{total}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-green-700 dark:text-green-300 font-medium mb-1">
              Completed All (A-10)
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {distribution[9]}
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <p className="text-amber-700 dark:text-amber-300 font-medium mb-1">Latest Completed</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              A-{String(Math.max(...distribution.map((_, i) => i + 1))).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground font-medium mb-1">Average Progress</p>
            <p className="text-xl font-bold">
              {Math.round(distribution.reduce((a, b) => a + b, 0) / 10)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
