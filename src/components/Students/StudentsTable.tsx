'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StudentWithRelations } from '@/types';
import { PAGE_ROUTES } from '@/lib/constants';
import { getStatusBadgeClass, getLastAssignmentNumber } from '@/lib/ui-helpers';
import { StudentAvatar } from './StudentAvatar';

interface StudentsTableProps {
  students: StudentWithRelations[];
}

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'On Track', value: 'On Track' },
  { label: 'Behind', value: 'Behind' },
  { label: 'At Risk', value: 'At Risk' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Dropped', value: 'Dropped' },
];

const PAGE_SIZE = 8;

export function StudentsTable({ students }: StudentsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone ?? '').includes(q);

      const matchStatus = statusFilter === 'all' || s.currentStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [students, search, statusFilter]);

  // ✅ FIX: safe total pages (never 0)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // ✅ FIX: clamp page when data changes
  useEffect(() => {
    setPage((prev) => {
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filtered.slice(start, end);
  }, [filtered, page]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPage(1);
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
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
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
                      <Link
                        href={PAGE_ROUTES.STUDENT_DETAIL.replace(':id', s._id!)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="View profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
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
          Showing {paginated.length} of {filtered.length} students
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded border text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
