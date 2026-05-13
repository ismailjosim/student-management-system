import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { FailingStudentsTable } from '@/components/dashboard/FailingStudentsTable';
import { CallQueue } from '@/components/dashboard/CallQueue';
import { SubmissionDistribution } from '@/components/dashboard/SubmissionDistribution';
import { DEMO_DASHBOARD_STATS, DEMO_STUDENTS } from '@/lib/demo-data';
import { Download } from 'lucide-react';

export default function DashboardPage() {
  // In production: fetch from API → dashboardApi.getStats()
  const stats = DEMO_DASHBOARD_STATS;
  const students = DEMO_STUDENTS;

  const atRiskStudents = students.filter(
    (s) => s.currentStatus === 'At Risk' || s.currentStatus === 'Behind'
  );

  const callQueueStudents = students.filter(
    (s) => s.currentStatus !== 'Completed' && s.currentStatus !== 'On Track'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohort Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of student progress and engagement.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors w-fit">
          <Download className="w-4 h-4" />
          Export Call List
        </button>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Charts + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SubmissionDistribution students={students} />
          <FailingStudentsTable students={atRiskStudents} />
        </div>
        <div>
          <CallQueue students={callQueueStudents} />
        </div>
      </div>
    </div>
  );
}
