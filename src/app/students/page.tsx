import { DEMO_STUDENTS } from '@/lib/demo-data';
import { StudentsTable } from '@/components/Students/StudentsTable';
import { FileUp, Plus } from 'lucide-react';

export default function StudentsPage() {
  // In production: fetch from API → studentApi.getAll()
  const students = DEMO_STUDENTS;

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
          <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors">
            <FileUp className="w-4 h-4" />
            Import CSV
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      <StudentsTable students={students} />
    </div>
  );
}
