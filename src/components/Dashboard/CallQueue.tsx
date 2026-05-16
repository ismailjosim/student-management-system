import Link from 'next/link';
import { Phone, ChevronRight, CheckCircle } from 'lucide-react';
import type { StudentWithRelations } from '@/types';
import { PAGE_ROUTES } from '@/lib/constants';
import { StudentAvatar } from '@/components/Students/StudentAvatar';
import { getStatusBadgeClass } from '@/lib/ui-helpers';

interface CallQueueProps {
  students: StudentWithRelations[];
  onRefresh?: () => void;
}

export function CallQueue({ students, onRefresh }: CallQueueProps) {
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
            <div
              key={s._id}
              className="px-5 py-3.5 hover:bg-muted/30 transition-colors flex items-center justify-between group"
            >
              <Link
                href={PAGE_ROUTES.STUDENT_DETAIL.replace(':id', s._id!)}
                className="flex items-center gap-3 flex-1"
              >
                <StudentAvatar name={s.name} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">{s.phone || 'No phone'}</p>
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadgeClass(s.currentStatus!)}`}
                    >
                      {s.currentStatus}
                    </span>
                  </div>
                </div>
              </Link>
              <Link href={PAGE_ROUTES.STUDENT_DETAIL.replace(':id', s._id!)} className="ml-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-4 border-t space-y-2">
        <button
          onClick={onRefresh}
          className="w-full px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Refresh Queue
        </button>
        <p className="text-[11px] text-muted-foreground text-center">
          {students.length} students need follow-up
        </p>
      </div>
    </div>
  );
}
