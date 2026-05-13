export interface FollowUp {
  _id?: string;
  date: Date;
  note: string;
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
  assignedTo?: string;
  tags?: string[];
}
