import { PAGE_ROUTES } from '@/lib/constants';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface StudentNotFoundProps {
  message?: string;
}

const StudentNotFound = ({ message = 'Student not found' }: StudentNotFoundProps) => {
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
          <p className="text-sm font-medium text-destructive">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentNotFound;
