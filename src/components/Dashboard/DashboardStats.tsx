import { Users, AlertTriangle, PhoneCall, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import type { DashboardStats as Stats } from '@/types';

interface DashboardStatsProps {
  stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const progressPct =
    stats.totalAssignments > 0
      ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
      : 0;

  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      desc: 'Active in cohort',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'At Risk',
      value: stats.atRiskStudents,
      desc: 'Need immediate attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Need Calls',
      value: stats.pendingFollowUps,
      desc: 'Pending follow-ups',
      icon: PhoneCall,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'On Track',
      value: stats.onTrackStudents,
      desc: 'Keeping up with assignments',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Completed',
      value: stats.completedStudents,
      desc: 'Finished all assignments',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Cohort Progress',
      value: `${progressPct}%`,
      desc: 'Average completion rate',
      icon: Clock,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ title, value, desc, icon: Icon, color, bg }) => (
        <div
          key={title}
          className="bg-background rounded-xl border shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
        >
          <div className={`${bg} ${color} w-9 h-9 rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium text-foreground">{title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
