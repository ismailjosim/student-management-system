/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardStats } from '@/components/Dashboard/DashboardStats';
import { FailingStudentsTable } from '@/components/Dashboard/FailingStudentsTable';
import { CallQueue } from '@/components/Dashboard/CallQueue';
import { SubmissionDistribution } from '@/components/Dashboard/SubmissionDistribution';
import { AssignmentCompletionStats } from '@/components/Dashboard/AssignmentCompletionStats';
import { dashboardApi, studentApi } from '@/lib/api-client';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import type { DashboardStats as DashboardStatsType, StudentWithRelations } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [allStudents, setAllStudents] = useState<StudentWithRelations[]>([]);
  const [failingStudents, setFailingStudents] = useState<StudentWithRelations[]>([]);
  const [callQueueStudents, setCallQueueStudents] = useState<StudentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [failingLoading, setFailingLoading] = useState(true);
  const [callQueueLoading, setCallQueueLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [failingPage, setFailingPage] = useState(1);
  const [callQueuePage, setCallQueuePage] = useState(1);
  const [failingTotalPages, setFailingTotalPages] = useState(1);
  const [callQueueTotalPages, setCallQueueTotalPages] = useState(1);
  const [failingTotalCount, setFailingTotalCount] = useState(0);
  const [callQueueTotalCount, setCallQueueTotalCount] = useState(0);

  const fetchOverviewData = useCallback(async () => {
    const [statsResponse, allStudentsResponse] = await Promise.all([
      dashboardApi.getStats(),
      studentApi.getAllPaginated(1, 1000),
    ]);

    if (statsResponse.error) {
      throw new Error(statsResponse.error);
    }

    if (statsResponse.data) {
      setStats(statsResponse.data as DashboardStatsType);
    }

    if (allStudentsResponse.data) {
      const data = Array.isArray(allStudentsResponse.data)
        ? allStudentsResponse.data
        : (allStudentsResponse.data as any).data || [];

      setAllStudents(data);
    }
  }, []);

  const fetchFailingStudents = useCallback(async () => {
    try {
      setFailingLoading(true);
      const failingResponse = await dashboardApi.getFailingStudents(failingPage, 10);

      if (failingResponse.error) {
        throw new Error(failingResponse.error);
      }

      if (
        failingResponse.data &&
        typeof failingResponse.data === 'object' &&
        'data' in failingResponse.data
      ) {
        setFailingStudents((failingResponse.data as any).data || []);
        setFailingTotalPages((failingResponse.data as any).totalPages || 1);
        setFailingTotalCount((failingResponse.data as any).total || 0);
      }
    } finally {
      setFailingLoading(false);
    }
  }, [failingPage]);

  const fetchCallQueue = useCallback(async () => {
    try {
      setCallQueueLoading(true);
      const callQueueResponse = await dashboardApi.getCallQueue(callQueuePage, 10);

      if (callQueueResponse.error) {
        throw new Error(callQueueResponse.error);
      }

      if (
        callQueueResponse.data &&
        typeof callQueueResponse.data === 'object' &&
        'data' in callQueueResponse.data
      ) {
        setCallQueueStudents((callQueueResponse.data as any).data || []);
        setCallQueueTotalPages((callQueueResponse.data as any).pagination?.pages || 1);
        setCallQueueTotalCount((callQueueResponse.data as any).pagination?.total || 0);
      }
    } finally {
      setCallQueueLoading(false);
    }
  }, [callQueuePage]);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setError(null);
        setLoading(true);
        await fetchOverviewData();
        setLastUpdated(new Date());
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [fetchOverviewData]);

  useEffect(() => {
    fetchFailingStudents().catch((err) => {
      const message = err instanceof Error ? err.message : 'Failed to fetch failing students';
      setError(message);
    });
  }, [fetchFailingStudents]);

  useEffect(() => {
    fetchCallQueue().catch((err) => {
      const message = err instanceof Error ? err.message : 'Failed to fetch call queue';
      setError(message);
    });
  }, [fetchCallQueue]);

  const filteredFailingStudents =
    statusFilter === 'all'
      ? failingStudents
      : failingStudents.filter((s) => s.currentStatus === statusFilter);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchOverviewData(), fetchFailingStudents(), fetchCallQueue()]);
      setLastUpdated(new Date());
      toast.success('Dashboard refreshed');
    } catch (
      _err // eslint-disable-line @typescript-eslint/no-unused-vars
    ) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

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
    } catch (
      _err // eslint-disable-line @typescript-eslint/no-unused-vars
    ) {
      toast.error('Failed to export call list');
    }
  };

  if (loading) {
    // Still loading initial data, but show page structure with stats
    return (
      <div className="space-y-8 animate-in fade-in duration-300 ">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cohort Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of student progress and engagement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
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

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
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
    <div className="space-y-8 animate-in fade-in duration-300 ">
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
            onClick={handleRefresh}
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
        <div className="flex items-center gap-3 p-4 px-0 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-xs text-destructive/80 mt-0.5">Showing cached data if available</p>
          </div>
          <button className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90">
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {stats && <DashboardStats stats={stats} />}

      {/* Assignment Completion Stats */}
      {allStudents.length > 0 && <AssignmentCompletionStats students={allStudents} />}

      {/* Charts + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {allStudents.length > 0 && <SubmissionDistribution students={allStudents} />}

          {/* Students at Risk Table with Filter */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-medium">Filter by Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All At Risk</option>
                <option value="At Risk">At Risk</option>
                <option value="Behind">Behind</option>
                <option value="Dropped">Dropped</option>
              </select>
              <span className="text-xs text-muted-foreground ml-auto">
                Showing {filteredFailingStudents.length} of {failingStudents.length}
              </span>
            </div>
            <FailingStudentsTable
              students={filteredFailingStudents}
              currentPage={failingPage}
              totalPages={failingTotalPages}
              totalCount={failingTotalCount}
              onPageChange={setFailingPage}
              loading={failingLoading}
            />
          </div>
        </div>
        <div>
          <CallQueue
            students={callQueueStudents}
            onRefresh={handleRefresh}
            currentPage={callQueuePage}
            totalPages={callQueueTotalPages}
            totalCount={callQueueTotalCount}
            onPageChange={setCallQueuePage}
            loading={callQueueLoading}
          />
        </div>
      </div>
    </div>
  );
}
