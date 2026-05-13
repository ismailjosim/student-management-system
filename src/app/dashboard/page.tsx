'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from '@/components/Dashboard/DashboardStats';
import { FailingStudentsTable } from '@/components/Dashboard/FailingStudentsTable';
import { CallQueue } from '@/components/Dashboard/CallQueue';
import { SubmissionDistribution } from '@/components/Dashboard/SubmissionDistribution';
import { dashboardApi } from '@/lib/api-client';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import type { DashboardStats as DashboardStatsType, StudentWithRelations } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [failingStudents, setFailingStudents] = useState<StudentWithRelations[]>([]);
  const [callQueueStudents, setCallQueueStudents] = useState<StudentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setRefreshing(true);

      // Fetch stats
      const statsResponse = await dashboardApi.getStats();
      if (statsResponse.error) {
        throw new Error(statsResponse.error);
      }

      if (statsResponse.data) {
        setStats(statsResponse.data as DashboardStatsType);
      }

      // Fetch failing students
      const failingResponse = await dashboardApi.getFailingStudents(1, 10);
      if (failingResponse.error) {
        throw new Error(failingResponse.error);
      }

      if (
        failingResponse.data &&
        typeof failingResponse.data === 'object' &&
        'data' in failingResponse.data
      ) {
        setFailingStudents((failingResponse.data as any).data || []);
      }

      // Fetch call queue (students needing calls - At Risk and Behind)
      const callQueueResponse = await dashboardApi.getFailingStudents(1, 8);
      if (callQueueResponse.error) {
        throw new Error(callQueueResponse.error);
      }

      if (
        callQueueResponse.data &&
        typeof callQueueResponse.data === 'object' &&
        'data' in callQueueResponse.data
      ) {
        setCallQueueStudents((callQueueResponse.data as any).data || []);
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCallList = () => {
    try {
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Status'],
        ...callQueueStudents.map((s) => [s.name, s.email, s.phone || 'N/A', s.currentStatus]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `call-list-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Call list exported successfully');
    } catch (err) {
      toast.error('Failed to export call list');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-background rounded-xl border p-4 space-y-3">
              <div className="h-9 w-9 bg-muted rounded-lg" />
              <div className="h-6 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohort Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of student progress and engagement.</p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCallList}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Call List
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-xs text-destructive/80 mt-0.5">Showing cached data if available</p>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {stats && <DashboardStats stats={stats} />}

      {/* Charts + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {failingStudents.length > 0 && <SubmissionDistribution students={failingStudents} />}
          <FailingStudentsTable students={failingStudents} />
        </div>
        <div>
          <CallQueue students={callQueueStudents} />
        </div>
      </div>
    </div>
  );
}
