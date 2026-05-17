// Assignment types - now embedded within Student documents

export type AssignmentStatus = 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'NOT_DEFINED';

// Embedded assignment within student document
export interface Assignment {
  assignmentNumber: number; // 1-10
  status: AssignmentStatus; // PENDING, SUBMITTED, COMPLETED, NOT_DEFINED
  date?: Date; // Submission/Completion date
  notes?: string;
}

// Alias for consistency
export type StudentAssignment = Assignment;
