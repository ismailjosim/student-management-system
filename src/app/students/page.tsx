/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentsTable } from '@/components/Students/StudentsTable';
import { FileUp, Plus, AlertCircle } from 'lucide-react';
import { studentApi } from '@/lib/api-client';
import { PAGE_ROUTES } from '@/lib/constants';
import type { StudentWithRelations } from '@/types';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await studentApi.getAllPaginated(
          currentPage,
          PAGE_SIZE,
          search,
          statusFilter
        );

        if (response.error) {
          throw new Error(response.error);
        }

        const data = response.data;

        if (Array.isArray(data)) {
          setStudents(data);
          // Extract pagination from rawResponse
          if ((response as any).rawResponse?.pagination) {
            console.log(
              'Setting pagination from rawResponse:',
              (response as any).rawResponse.pagination
            );
            setTotalPages((response as any).rawResponse.pagination.pages || 1);
            setTotalStudents((response as any).rawResponse.pagination.total || 0);
          }
        } else if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          Array.isArray((data as any).data)
        ) {
          setStudents((data as any).data);
          // Extract pagination from rawResponse
          if ((response as any).rawResponse?.pagination) {
            setTotalPages((response as any).rawResponse.pagination.pages || 1);
            setTotalStudents((response as any).rawResponse.pagination.total || 0);
          }
        } else if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'data' in data &&
          Array.isArray((data as any).data)
        ) {
          setStudents((data as any).data);
          // Extract pagination from rawResponse
          if ((response as any).rawResponse?.pagination) {
            setTotalPages((response as any).rawResponse.pagination.pages || 1);
            setTotalStudents((response as any).rawResponse.pagination.total || 0);
          }
        } else {
          setStudents([]);
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
  }, [currentPage, search, statusFilter]);

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to page 1 when filtering
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCurrentPage(1);
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
        <div className="flex items-center gap-2">
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

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      ) : (
        <StudentsTable
          students={students}
          currentPage={currentPage}
          totalPages={totalPages}
          totalStudents={totalStudents}
          onPageChange={setCurrentPage}
          isLoading={loading}
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusChange}
          onResetFilters={handleResetFilters}
        />
      )}
    </div>
  );
}
