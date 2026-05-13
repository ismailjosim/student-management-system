import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Monitor,
  Users,
} from 'lucide-react';
import type { StudentWithRelations } from '@/types';
import { getStatusBadgeClass } from '@/lib/ui-helpers';
import { StudentAvatar } from './StudentAvatar';

interface StudentProfileCardProps {
  student: StudentWithRelations;
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  const rows = [
    { icon: Phone, label: 'Phone', value: student.phone },
    { icon: MessageCircle, label: 'WhatsApp', value: student.whatsapp },
    {
      icon: MapPin,
      label: 'Location',
      value: [student.town, student.district, student.division].filter(Boolean).join(', ') || null,
    },
    { icon: Briefcase, label: 'Occupation', value: student.occupation },
    { icon: GraduationCap, label: 'Institute', value: student.institute },
    { icon: Monitor, label: 'Device', value: student.workingDevice },
    { icon: Users, label: 'Age Range', value: student.ageRange },
  ];

  return (
    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 flex flex-col items-center text-center border-b bg-muted/20">
        <StudentAvatar name={student.name} size="lg" className="mb-3" />
        <h2 className="text-xl font-bold">{student.name}</h2>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
          <Mail className="w-3 h-3" />
          {student.email}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold border ${getStatusBadgeClass(student.currentStatus!)}`}
          >
            {student.currentStatus}
          </span>
          {student.mentorshipJoiningStatus ? (
            <span className="inline-flex px-2.5 py-1 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              In Group
            </span>
          ) : (
            <span className="inline-flex px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
              Not in Group
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3">
        {rows.map(({ icon: Icon, label, value }) =>
          value ? (
            <div key={label} className="flex items-start gap-3 text-sm">
              <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex justify-between w-full gap-2">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-right">{value}</span>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Comments */}
      {student.comments && student.comments.length > 0 && (
        <div className="px-5 py-4 border-t bg-muted/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Notes
          </p>
          <ul className="space-y-1">
            {student.comments.map((c, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                • {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
