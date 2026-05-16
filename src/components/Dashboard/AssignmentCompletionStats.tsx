import type { StudentWithRelations } from '@/types';
import { getLastAssignmentNumber } from '@/lib/ui-helpers';

interface AssignmentCompletionStatsProps {
  students: StudentWithRelations[];
}

export function AssignmentCompletionStats({ students }: AssignmentCompletionStatsProps) {
  // Calculate completion count for each assignment (1-10)
  const assignmentStats = Array.from({ length: 10 }, (_, i) => {
    const assignmentNum = i + 1;
    const completedCount = students.filter(
      (s) => getLastAssignmentNumber(s.lastCompletedAssignment) >= assignmentNum
    ).length;
    return {
      number: assignmentNum,
      completed: completedCount,
      percentage: students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0,
    };
  });

  return (
    <div className="bg-background rounded-xl border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Assignment Completion Stats
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Total students who completed each assignment
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {assignmentStats.map(({ number, completed, percentage }) => (
            <div
              key={number}
              className="bg-background rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                A-{String(number).padStart(2, '0')}
              </p>
              <p className="text-3xl font-bold text-foreground mb-1">{completed}</p>
              <p className="text-xs text-muted-foreground font-medium mb-2">
                student{completed !== 1 ? 's' : ''}
              </p>
              <p className="text-sm font-semibold text-foreground">{percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
