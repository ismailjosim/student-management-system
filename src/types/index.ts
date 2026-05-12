export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'dropped';
export type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'overdue';
export type CallLogStatus = 'completed' | 'missed' | 'scheduled';
export type CallLogType = 'phone' | 'video' | 'message';
export type FollowUpStatus = 'pending' | 'in-progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalAssignments: number;
  pendingAssignments: number;
  totalCallLogs: number;
  pendingFollowUps: number;
}

declare global {
  var mongoose: {
    conn: unknown;
    promise: Promise<unknown>;
  };
}
