'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StudentWithRelations } from '@/types';
import { PAGE_ROUTES } from '@/lib/constants';
import { getStatusBadgeClass, getLastAssignmentNumber } from '@/lib/ui-helpers';
import { StudentAvatar } from './StudentAvatar';

interface StudentsTableProps {
  students: StudentWithRelations[];
  currentPage?: number;
  totalPages?: number;
  totalStudents?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (search: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  onResetFilters?: () => void;
}

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'On Track', value: 'On Track' },
  { label: 'Behind', value: 'Behind' },
  { label: 'At Risk', value: 'At Risk' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Dropped', value: 'Dropped' },
];

const PAGE_SIZE = 10;

export function StudentsTable({
  students,
  currentPage = 1,
  totalPages = 1,
  totalStudents = 0,
  onPageChange,
  isLoading = false,
  search = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  onResetFilters,
}: StudentsTableProps) {
  // Use provided state if callbacks exist, otherwise use local state
  const hasExternalState = !!onSearchChange && !!onStatusFilterChange && !!onResetFilters;
  const [localSearch, setLocalSearch] = useState('');
  const [localStatusFilter, setLocalStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    studentId?: string;
    studentName?: string;
  }>({
    isOpen: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const effectiveSearch = hasExternalState ? search : localSearch;
  const effectiveStatusFilter = hasExternalState ? statusFilter : localStatusFilter;

  // Use server-side pagination if onPageChange is provided, otherwise use client-side
  const isServerPaginated = !!onPageChange;

  const filtered = useMemo(() => {
    // Skip filtering if using server-side pagination
    if (isServerPaginated) {
      return students;
    }

    const q = effectiveSearch.toLowerCase();

    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone ?? '').includes(q);

      const matchStatus =
        effectiveStatusFilter === 'all' || s.currentStatus === effectiveStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [students, effectiveSearch, effectiveStatusFilter, isServerPaginated]);

  // Client-side pagination
  const clientTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const [clientPage, setClientPage] = useState(1);

  const paginated = useMemo(() => {
    if (isServerPaginated) {
      return students;
    }
    const start = (clientPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filtered.slice(start, end);
  }, [filtered, clientPage, isServerPaginated, students]);

  const displayPage = isServerPaginated ? currentPage : clientPage;
  const displayTotalPages = isServerPaginated ? totalPages : clientTotalPages;

  const handleSearch = (val: string) => {
    if (hasExternalState && onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalSearch(val);
      setClientPage(1);
    }
  };

  const handleFilter = (val: string) => {
    if (hasExternalState && onStatusFilterChange) {
      onStatusFilterChange(val);
    } else {
      setLocalStatusFilter(val);
      setClientPage(1);
    }
  };

  const resetFilters = () => {
    if (hasExternalState && onResetFilters) {
      onResetFilters();
    } else {
      setLocalSearch('');
      setLocalStatusFilter('all');
      setClientPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (isServerPaginated && onPageChange) {
      onPageChange(page);
    } else {
      setClientPage(page);
    }
  };

  const handleDeleteClick = (studentId: string, studentName: string) => {
    setDeleteModal({ isOpen: true, studentId, studentName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.studentId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/students/${deleteModal.studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete student');
      }

      // Close modal
      setDeleteModal({ isOpen: false });

      // Refresh the page or trigger parent refresh
      window.location.reload();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(
        `Failed to delete student: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false });
  };

  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="px-5 py-4 border-b bg-muted/20 flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={effectiveSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={effectiveStatusFilter}
            onChange={(e) => handleFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="p-2 border rounded-md hover:bg-muted transition-colors"
            title="Reset filters"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/10">
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Progress
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Group
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Division
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Device
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center text-muted-foreground italic">
                  No students found matching your criteria.
                </td>
              </tr>
            ) : (
              paginated.map((s) => {
                const lastDone = getLastAssignmentNumber(s.lastCompletedAssignment);
                const pct = lastDone * 10;

                return (
                  <tr key={s._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={s.name} size="sm" />
                        <div>
                          <p className="font-semibold">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 w-28">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span>{lastDone}/10</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusBadgeClass(
                          s.currentStatus!
                        )}`}
                      >
                        {s.currentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {s.mentorshipJoiningStatus ? (
                        <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                          In Group
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.division ?? '—'}</td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {s.workingDevice ?? '—'}
                    </td>

                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={PAGE_ROUTES.STUDENT_DETAIL.replace(':id', s._id!)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="View profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(s._id!, s.name)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                          title="Delete student"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t bg-muted/10 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {paginated.length} of {isServerPaginated ? totalStudents : filtered.length}{' '}
          students
        </p>

        {displayTotalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, displayPage - 1))}
              disabled={displayPage === 1 || isLoading}
              className="p-1.5 rounded border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(displayTotalPages, 10) }, (_, i) => {
              // Show first 10 page numbers, or adjust to show current page in range
              const pageNum = i + 1;
              if (displayTotalPages <= 10) return pageNum;
              if (displayPage <= 5) return pageNum;
              if (displayPage > displayTotalPages - 5) return displayTotalPages - 9 + i;
              return displayPage - 5 + i + 1;
            }).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                disabled={isLoading}
                className={`w-8 h-8 rounded border text-sm font-medium transition-colors ${
                  p === displayPage
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted disabled:opacity-40'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(displayTotalPages, displayPage + 1))}
              disabled={displayPage === displayTotalPages || isLoading}
              className="p-1.5 rounded border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg border shadow-lg max-w-sm w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Delete Student</h2>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-foreground mb-2">
                Are you sure you want to delete <strong>{deleteModal.studentName}</strong>?
              </p>
              <p className="text-xs text-muted-foreground">
                This action will permanently remove the student and all related data including
                assignments, call logs, and follow-ups from the database. This cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
