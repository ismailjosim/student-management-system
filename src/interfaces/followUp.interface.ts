export interface FollowUp {
  _id?: string;
  studentId: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FollowUpCreateInput {
  studentId: string;
  title: string;
  description: string;
  dueDate: string | Date;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  tags?: string[];
}

export interface FollowUpUpdateInput {
  title?: string;
  description?: string;
  dueDate?: string | Date;
  completedDate?: string | Date;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  tags?: string[];
}
