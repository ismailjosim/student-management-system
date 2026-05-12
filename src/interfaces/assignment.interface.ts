export interface Assignment {
  _id?: string;
  studentId: string;
  title: string;
  description: string;
  dueDate: Date;
  submittedDate?: Date;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssignmentCreateInput {
  studentId: string;
  title: string;
  description: string;
  dueDate: string | Date;
  status?: 'pending' | 'submitted' | 'graded' | 'overdue';
}

export interface AssignmentUpdateInput {
  title?: string;
  description?: string;
  dueDate?: string | Date;
  submittedDate?: string | Date;
  status?: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  feedback?: string;
}
