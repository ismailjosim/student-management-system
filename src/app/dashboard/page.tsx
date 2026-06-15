/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DashboardStats } from '@/components/Dashboard/DashboardStats';
import { FailingStudentsTable } from '@/components/Dashboard/FailingStudentsTable';
import { CallQueue } from '@/components/Dashboard/CallQueue';
import { SubmissionDistribution } from '@/components/Dashboard/SubmissionDistribution';
import { AssignmentCompletionStats } from '@/components/Dashboard/AssignmentCompletionStats';
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton';
import { dashboardApi } from '@/lib/api-client';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import type { DashboardStats as DashboardStatsType, StudentWithRelations } from '@/types';
import toast from 'react-hot-toast';

interface DashboardOverview {
  stats: DashboardStatsType;
  students: StudentWithRelations[];
  failingStudents: StudentWithRelations[];
  failingPagination: { page: number; total: number; pages: number };
  callQueue: StudentWithRelations[];
  callQueuePagination: { page: number; total: number; pages: number };
}

let dashboardMemoryCache: DashboardOverview | null = null;

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
  const skipInitialFailingRequest = useRef(true);
  const skipInitialCallQueueRequest = useRef(true);

  const applyOverview = useCallback((overview: DashboardOverview) => {
    setStats(overview.stats);
    setAllStudents(overview.students || []);
    setFailingStudents(overview.failingStudents || []);
    setFailingTotalPages(overview.failingPagination?.pages || 1);
    setFailingTotalCount(overview.failingPagination?.total || 0);
    setCallQueueStudents(overview.callQueue || []);
    setCallQueueTotalPages(overview.callQueuePagination?.pages || 1);
    setCallQueueTotalCount(overview.callQueuePagination?.total || 0);
  }, []);

  const fetchOverviewData = useCallback(async () => {
    const response = await dashboardApi.getOverview();
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Dashboard returned no data');

    const overview = response.data as DashboardOverview;
    applyOverview(overview);
    dashboardMemoryCache = overview;
  }, [applyOverview]);

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
      if (dashboardMemoryCache) {
        applyOverview(dashboardMemoryCache);
        setLoading(false);
      }

      try {
        setError(null);
        if (!dashboardMemoryCache) setLoading(true);
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
  }, [applyOverview, fetchOverviewData]);

  useEffect(() => {
    if (skipInitialFailingRequest.current) {
      skipInitialFailingRequest.current = false;
      return;
    }

    fetchFailingStudents().catch((err) => {
      const message = err instanceof Error ? err.message : 'Failed to fetch failing students';
      setError(message);
    });
  }, [fetchFailingStudents]);

  useEffect(() => {
    if (skipInitialCallQueueRequest.current) {
      skipInitialCallQueueRequest.current = false;
      return;
    }

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
      setFailingPage(1);
      setCallQueuePage(1);
      await fetchOverviewData();
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
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="page-header rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur-sm sm:p-7">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Operations overview
          </p>
          <h1 className="page-title">Cohort Dashboard</h1>
          <p className="page-description">
            A live view of student progress, outreach priorities, and cohort momentum.
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCallList}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-hover"
          >
            <Download className="w-4 h-4" />
            Export Call List
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger-border bg-danger-soft p-4">
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
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
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
