import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { DEMO_STUDENTS, DEMO_ASSIGNMENTS, DEMO_CALL_LOGS, DEMO_FOLLOW_UPS } from '@/lib/demo-data';
import { StudentProfileCard } from '@/components/students/StudentProfileCard';
import { AssignmentChecklist } from '@/components/students/AssignmentChecklist';
import { CallLogSection } from '@/components/students/CallLogSection';
import { FollowUpSection } from '@/components/students/FollowUpSection';
import { PAGE_ROUTES } from '@/lib/constants';

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;

  // In production: fetch from API → studentApi.getById(id)
  const student = DEMO_STUDENTS.find((s) => s._id === id);
  if (!student) notFound();

  const assignments = DEMO_ASSIGNMENTS.filter((a) => a.studentId === id);
  const callLogs = DEMO_CALL_LOGS.filter((c) => c.studentId === id);
  const followUps = DEMO_FOLLOW_UPS.filter((f) => f.studentId === id);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <StudentProfileCard student={student} />
          <AssignmentChecklist assignments={assignments} studentId={id} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <CallLogSection callLogs={callLogs} studentId={id} />
          <FollowUpSection followUps={followUps} studentId={id} />
        </div>
      </div>
    </div>
  );
}
