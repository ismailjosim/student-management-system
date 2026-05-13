export type AssignmentStatus = 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'NOT_DEFINED';

export interface Assignment {
  _id?: string;
  assignmentNumber: number; // 1-10
  status: AssignmentStatus;
  completedDate?: Date;
  notes?: string;
  studentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssignmentCreateInput {
  assignmentNumber: number;
  status?: AssignmentStatus;
  completedDate?: Date;
  notes?: string;
  studentId: string;
}

export interface AssignmentUpdateInput {
  assignmentNumber?: number;
  status?: AssignmentStatus;
  completedDate?: Date;
  notes?: string;
}
