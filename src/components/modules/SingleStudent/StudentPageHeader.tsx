import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { PAGE_ROUTES } from '@/lib/constants';

interface StudentPageHeaderProps {
  student: {
    name: string;
  };
}

const StudentPageHeader = ({ student }: StudentPageHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href={PAGE_ROUTES.STUDENTS}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Students
        </Link>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{student?.name || 'Student'}</h1>

        <p className="mt-1 text-muted-foreground">Student profile and progress tracking.</p>
      </div>
    </div>
  );
};

export default StudentPageHeader;
