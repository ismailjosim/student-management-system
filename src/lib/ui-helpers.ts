import type { StudentStatus } from '@/interfaces/student.interface';
import type { AssignmentStatus } from '@/interfaces/assignment.interface';
import type { CallLogStatus } from '@/interfaces/callLog.interface';

export function getStatusBadgeClass(status: StudentStatus): string {
  switch (status) {
    case 'On Track':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Behind':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'At Risk':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Dropped':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'Completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export function getAssignmentStatusClass(status: AssignmentStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500';
    case 'SUBMITTED':
      return 'bg-blue-400';
    case 'PENDING':
      return 'bg-muted';
    case 'NOT_DEFINED':
    default:
      return 'bg-muted/40';
  }
}

export function getCallLogStatusLabel(status: CallLogStatus): string {
  switch (status) {
    case 'RECEIVED':
      return 'Received';
    case 'NOT_RECEIVED':
      return 'Not Received';
    case 'PHONE_OFF':
      return 'Phone Off';
    case 'SWITCHED_OFF':
      return 'Switched Off';
    case 'FOREIGN_NUMBER':
      return 'Foreign Number';
    default:
      return status;
  }
}

export function getCallLogStatusClass(status: CallLogStatus): string {
  switch (status) {
    case 'RECEIVED':
      return 'bg-green-100 text-green-800';
    case 'NOT_RECEIVED':
      return 'bg-yellow-100 text-yellow-800';
    case 'PHONE_OFF':
    case 'SWITCHED_OFF':
      return 'bg-red-100 text-red-800';
    case 'FOREIGN_NUMBER':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getLastAssignmentNumber(lastCompleted: string | undefined): number {
  if (!lastCompleted || lastCompleted === 'None') return 0;
  return parseInt(lastCompleted.replace('A-', ''), 10);
}

export function getProgressPercent(lastCompleted: string | undefined): number {
  return getLastAssignmentNumber(lastCompleted) * 10;
}
