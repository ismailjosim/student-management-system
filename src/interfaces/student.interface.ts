export interface Student {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  currentGrade?: number;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentCreateInput {
  name: string;
  email: string;
  phone: string;
  enrollmentDate: string | Date;
  status?: 'active' | 'inactive' | 'graduated' | 'dropped';
  currentGrade?: number;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
}

export interface StudentUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'dropped';
  currentGrade?: number;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
}
