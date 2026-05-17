import type { StudentWithRelations } from '@/types';
import { getLastAssignmentNumber } from '@/lib/ui-helpers';

interface AssignmentCompletionStatsProps {
  students: StudentWithRelations[];
}

// 10 distinct colors for each assignment
const ASSIGNMENT_COLORS = [
  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }, // A-01
  { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }, // A-02
  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }, // A-03
  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }, // A-04
  { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }, // A-05
  { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' }, // A-06
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' }, // A-07
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' }, // A-08
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }, // A-09
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' }, // A-10
];

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
      color: ASSIGNMENT_COLORS[i],
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
          {assignmentStats.map(({ number, completed, percentage, color }) => (
            <div
              key={number}
              className={`${color.bg} rounded-lg border ${color.border} shadow-sm p-4 hover:shadow-md transition-shadow text-center`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider ${color.text} mb-3`}>
                A-{String(number).padStart(2, '0')}
              </p>
              <p className={`text-3xl font-bold ${color.text} mb-1`}>{completed}</p>
              <p className={`text-xs ${color.text} font-medium mb-2 opacity-75`}>
                student{completed !== 1 ? 's' : ''}
              </p>
              <p className={`text-sm font-semibold ${color.text}`}>{percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
