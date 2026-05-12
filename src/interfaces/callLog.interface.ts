export interface CallLog {
  _id?: string;
  studentId: string;
  callDate: Date;
  duration: number;
  notes: string;
  nextCallDate?: Date;
  status: 'completed' | 'missed' | 'scheduled';
  callType: 'phone' | 'video' | 'message';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CallLogCreateInput {
  studentId: string;
  callDate: string | Date;
  duration: number;
  notes: string;
  nextCallDate?: string | Date;
  status?: 'completed' | 'missed' | 'scheduled';
  callType: 'phone' | 'video' | 'message';
}

export interface CallLogUpdateInput {
  callDate?: string | Date;
  duration?: number;
  notes?: string;
  nextCallDate?: string | Date;
  status?: 'completed' | 'missed' | 'scheduled';
  callType?: 'phone' | 'video' | 'message';
}
