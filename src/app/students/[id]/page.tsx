'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { studentApi } from '@/lib/api-client';
import { StudentProfileCard } from '@/components/Students/StudentProfileCard';
import { AssignmentChecklist } from '@/components/Students/AssignmentChecklist';
import { CallLogSection } from '@/components/Students/CallLogSection';
import { FollowUpSection } from '@/components/Students/FollowUpSection';
import { PAGE_ROUTES } from '@/lib/constants';
import type { StudentWithRelations } from '@/types';
import toast from 'react-hot-toast';

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const [studentId, setStudentId] = useState<string>('');
  const [student, setStudent] = useState<StudentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = async (studentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentApi.getById(studentId);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setStudent(response.data as StudentWithRelations);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch student';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    params.then((p) => {
      if (p.id) {
        setStudentId(p.id);
        fetchStudent(p.id);
      }
    });
  }, [params]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <Link
          href={PAGE_ROUTES.STUDENTS}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Students
        </Link>
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{error || 'Student not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const assignments = student.assignments || [];
  const callLogs = student.callLogs || [];
  const followUps = student.followUps || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href={PAGE_ROUTES.STUDENTS}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Students
        </Link>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
        <p className="text-muted-foreground mt-1">Student profile and progress tracking.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <StudentProfileCard student={student} onUpdate={() => fetchStudent(studentId)} />
          <AssignmentChecklist
            assignments={assignments}
            studentId={studentId}
            onUpdate={() => fetchStudent(studentId)}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <CallLogSection callLogs={callLogs} studentId={studentId} />
          <FollowUpSection followUps={followUps} studentId={studentId} />
        </div>
      </div>
    </div>
  );
}
