/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentsTable } from '@/components/Students/StudentsTable';
import { FileUp, Plus, AlertCircle, Sparkles, X, Loader2 } from 'lucide-react';
import { studentApi } from '@/lib/api-client';
import { PAGE_ROUTES } from '@/lib/constants';
import type { StudentWithRelations } from '@/types';
import toast from 'react-hot-toast';

interface AnalysisResult {
  totalStudents: number;
  completedAssignment: number;
  completedCount: number;
  notCompletedCount: number;
  updatedCount: number;
  students: Array<{
    id: string;
    name: string;
    completed: boolean;
    previousStatus: string;
    newStatus: string;
  }>;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [progressFilter, setProgressFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showAnalyzePanel, setShowAnalyzePanel] = useState(false);

  const PAGE_SIZE = 10;

  // Fetch current assignment from MongoDB on mount
  useEffect(() => {
    const fetchCurrentAssignment = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success && data.data?.currentAssignment) {
          const assignmentNum = parseInt(data.data.currentAssignment.split('-')[1]);
          setSelectedAssignment(assignmentNum);
        }
      } catch (error) {
        console.error('Failed to fetch current assignment:', error);
      }
    };
    fetchCurrentAssignment();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await studentApi.getAllPaginated(
          currentPage,
          PAGE_SIZE,
          search,
          statusFilter === 'all' ? '' : statusFilter,
          {
            device: deviceFilter === 'all' ? '' : deviceFilter,
            group: groupFilter === 'all' ? '' : groupFilter,
            progress: progressFilter === 'all' ? '' : progressFilter,
          }
        );

        if (response.error) {
          throw new Error(response.error);
        }

        const data = response.data;
        const pagination = (response as any).rawResponse?.pagination;
        const updatePagination = (fallbackCount: number) => {
          setTotalPages(pagination?.pages || Math.max(1, Math.ceil(fallbackCount / PAGE_SIZE)));
          setTotalStudents(pagination?.total || fallbackCount);
        };

        if (Array.isArray(data)) {
          setStudents(data);
          updatePagination(data.length);
        } else if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          Array.isArray((data as any).data)
        ) {
          setStudents((data as any).data);
          updatePagination((data as any).data.length);
        } else if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'data' in data &&
          Array.isArray((data as any).data)
        ) {
          setStudents((data as any).data);
          updatePagination((data as any).data.length);
        } else {
          setStudents([]);
          setTotalPages(1);
          setTotalStudents(0);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch students';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentPage, search, statusFilter, progressFilter, groupFilter, deviceFilter]);

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status === 'all' ? '' : status);
    setCurrentPage(1); // Reset to page 1 when filtering
  };

  const handleProgressChange = (progress: string) => {
    setProgressFilter(progress === 'all' ? '' : progress);
    setCurrentPage(1);
  };

  const handleGroupChange = (group: string) => {
    setGroupFilter(group === 'all' ? '' : group);
    setCurrentPage(1);
  };

  const handleDeviceChange = (device: string) => {
    setDeviceFilter(device === 'all' ? '' : device);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setProgressFilter('');
    setGroupFilter('');
    setDeviceFilter('');
    setCurrentPage(1);
  };

  const handleExportFiltered = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();

      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (progressFilter) params.set('progress', progressFilter);
      if (groupFilter) params.set('group', groupFilter);
      if (deviceFilter) params.set('device', deviceFilter);

      const response = await fetch(`/api/export/call-list?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to export students');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename =
        filenameMatch?.[1] || `filtered-call-list-${new Date().toISOString().split('T')[0]}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Filtered call sheet exported');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export students';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);

      const currentAssignment = `A-${String(selectedAssignment).padStart(2, '0')}`;

      const settingsResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAssignment }),
      });

      if (!settingsResponse.ok) {
        const data = await settingsResponse.json();
        throw new Error(data.message || data.error || 'Failed to save current assignment');
      }

      const response = await fetch(`/api/students/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentNumber: selectedAssignment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to analyze');
      }

      const data = await response.json();
      setAnalysisResult(data.data);
      setShowAnalysisModal(true);
      setShowAnalyzePanel(false);
      toast.success('Analysis completed!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze students';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Roster</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive list of all cohort participants.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAnalyzePanel(!showAnalyzePanel)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Analyze
            </button>
            <Link
              href={`${PAGE_ROUTES.STUDENTS}/import`}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              <FileUp className="w-4 h-4" />
              Import CSV
            </Link>
            <Link
              href={`${PAGE_ROUTES.STUDENTS}/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </Link>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analyze Panel */}
      {showAnalyzePanel && (
        <div className="p-4 bg-linear-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Analyze All Students
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Select an assignment and analyze completion status for all students. Statuses will
                be automatically updated based on completion.
              </p>
            </div>
            <button
              onClick={() => setShowAnalyzePanel(false)}
              className="p-1 hover:bg-purple-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Select Assignment
              </label>
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(parseInt(e.target.value))}
                disabled={isAnalyzing}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    A-{String(num).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border shadow-2xl max-w-sm w-full">
            <div className="p-8 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Analyzing Students</h2>
                <p className="text-sm text-muted-foreground">
                  Processing assignment{' '}
                  <strong>A-{String(selectedAssignment).padStart(2, '0')}</strong>...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Modal */}
      {showAnalysisModal && analysisResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 border-b bg-linear-to-r from-purple-50 to-blue-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Analysis Results
              </h2>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-blue-700">{analysisResult.totalStudents}</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Assignment Analyzed</p>
                  <p className="text-3xl font-bold text-purple-700">
                    A-{String(analysisResult.completedAssignment).padStart(2, '0')}
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-700">
                    {analysisResult.completedCount}{' '}
                    <span className="text-sm text-muted-foreground">
                      (
                      {Math.round(
                        (analysisResult.completedCount / analysisResult.totalStudents) * 100
                      )}
                      %)
                    </span>
                  </p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Not Completed</p>
                  <p className="text-3xl font-bold text-orange-700">
                    {analysisResult.notCompletedCount}{' '}
                    <span className="text-sm text-muted-foreground">
                      (
                      {Math.round(
                        (analysisResult.notCompletedCount / analysisResult.totalStudents) * 100
                      )}
                      %)
                    </span>
                  </p>
                </div>
              </div>

              {/* Updated Students */}
              {analysisResult.updatedCount > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-semibold text-amber-900">
                    ✓ {analysisResult.updatedCount} student
                    {analysisResult.updatedCount !== 1 ? 's' : ''} status updated
                  </p>
                </div>
              )}

              {/* Detailed List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Student Details
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysisResult.students.map((student, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        student.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {student.completed ? (
                              <span className="text-green-700 font-medium">✓ Completed</span>
                            ) : (
                              <span className="text-orange-700 font-medium">✗ Not Completed</span>
                            )}
                          </p>
                        </div>
                        {student.previousStatus !== student.newStatus && (
                          <div className="text-xs">
                            <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded mr-2 font-medium">
                              {student.previousStatus}
                            </span>
                            <span className="inline-block px-2 py-1 bg-purple-200 text-purple-700 rounded font-medium">
                              {student.newStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t bg-muted/20 flex justify-end gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        currentAssignment: `A-${String(selectedAssignment).padStart(2, '0')}`,
                      }),
                    });
                    if (response.ok) {
                      setShowAnalysisModal(false);
                      window.location.reload();
                    } else {
                      toast.error('Failed to save assignment');
                    }
                  } catch (
                    _error // eslint-disable-line @typescript-eslint/no-unused-vars
                  ) {
                    toast.error('Failed to save assignment');
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Done & Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      <StudentsTable
        students={students}
        currentPage={currentPage}
        totalPages={totalPages}
        totalStudents={totalStudents}
        onPageChange={setCurrentPage}
        isLoading={loading}
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter || 'all'}
        onStatusFilterChange={handleStatusChange}
        progressFilter={progressFilter || 'all'}
        onProgressFilterChange={handleProgressChange}
        groupFilter={groupFilter || 'all'}
        onGroupFilterChange={handleGroupChange}
        deviceFilter={deviceFilter || 'all'}
        onDeviceFilterChange={handleDeviceChange}
        onResetFilters={handleResetFilters}
        onExportFiltered={handleExportFiltered}
        isExporting={isExporting}
      />
    </div>
  );
}
