import Link from 'next/link';
import { AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import type { StudentWithRelations } from '@/types';
import { getStatusBadgeClass, getLastAssignmentNumber } from '@/lib/ui-helpers';
import { PAGE_ROUTES } from '@/lib/constants';
import { StudentAvatar } from '@/components/Students/StudentAvatar';

interface FailingStudentsTableProps {
  students: StudentWithRelations[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

export function FailingStudentsTable({
  students,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  loading = false,
}: FailingStudentsTableProps) {
  return (
    <div className="surface overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-danger-foreground" />
          <h2 className="font-semibold">Students at Risk</h2>
        </div>
        <span className="rounded-full border border-danger-border bg-danger-soft px-2.5 py-1 text-xs font-semibold text-danger-foreground">
          {students.length} students
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Last Done
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-1 flex-1">
                        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-32 animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="h-4 bg-muted rounded w-20 ml-auto animate-pulse" />
                  </td>
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-muted-foreground italic text-sm"
                >
                  No students currently at risk.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <StudentAvatar name={s.name} size="sm" />
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    A-{String(getLastAssignmentNumber(s.lastCompletedAssignment)).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusBadgeClass(s.currentStatus!)}`}
                    >
                      {s.currentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={PAGE_ROUTES.STUDENT_DETAIL.replace(':id', s._id!)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Profile <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {onPageChange && (
        <div className="px-6 py-4 border-t flex items-center justify-between bg-muted/20">
          <span className="text-xs text-muted-foreground">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            {totalCount > 0 && ` • ${totalCount} total students`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
