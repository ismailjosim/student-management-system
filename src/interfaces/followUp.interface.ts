export type FollowUpStatus = 'pending' | 'completed' | 'overdue';

export interface FollowUp {
  _id?: string;
  date: Date;
  note: string;
  status?: FollowUpStatus;
  completedDate?: Date;
  studentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FollowUpCreateInput {
  date?: Date;
  note: string;
  studentId: string;
}

export interface FollowUpUpdateInput {
  date?: Date;
  note?: string;
  status?: FollowUpStatus;
  completedDate?: Date;
}
