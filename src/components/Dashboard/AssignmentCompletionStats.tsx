import { CheckCircle2 } from 'lucide-react';
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Assignment Completion Stats</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Total students who completed each assignment
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
        {assignmentStats.map(({ number, completed, percentage }) => (
          <div
            key={number}
            className="bg-background rounded-lg border shadow-sm p-3 hover:shadow-md transition-shadow text-center"
          >
            <div className="flex justify-center mb-2">
              <CheckCircle2
                className={`w-5 h-5 ${completed > 0 ? 'text-green-600' : 'text-muted-foreground'}`}
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              A-{String(number).padStart(2, '0')}
            </p>
            <p className="text-2xl font-bold text-foreground">{completed}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
