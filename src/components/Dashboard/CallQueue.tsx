import Link from 'next/link';
import { Phone, ChevronRight } from 'lucide-react';
import type { StudentWithRelations } from '@/types';
import { PAGE_ROUTES } from '@/lib/constants';
import { StudentAvatar } from '@/components/Students/StudentAvatar';

interface CallQueueProps {
  students: StudentWithRelations[];
}

export function CallQueue({ students }: CallQueueProps) {
  return (
    <div className="bg-background rounded-xl border shadow-sm flex flex-col h-full">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2 text-amber-600">
          <Phone className="w-4 h-4" />
          <h2 className="font-semibold">Call Queue</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Students needing follow-up calls.</p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-125 divide-y divide-border">
        {students.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground italic">
            Queue is empty! 🎉
          </div>
        ) : (
          students.map((s) => (
            <Link
              key={s._id}
              href={PAGE_ROUTES.STUDENT_DETAIL.replace(':id', s._id!)}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <StudentAvatar name={s.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.phone}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))
        )}
      </div>

      <div className="px-5 py-4 border-t">
        <button className="w-full px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors">
          Process Queue
        </button>
      </div>
    </div>
  );
}
