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

  const max = Math.max(...distribution, 1);

  return (
    <div className="bg-background rounded-xl border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Submission Distribution
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Students who have completed each assignment
        </p>
      </div>
      <div className="p-6">
        <div className="flex items-end justify-between gap-1.5 h-36">
          {distribution.map((count, i) => {
            const heightPct = (count / max) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                <span className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {count}
                </span>
                <div
                  className="w-full bg-primary/15 hover:bg-primary/30 rounded-t transition-colors relative"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
                <span className="text-[10px] text-muted-foreground font-medium">A{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
