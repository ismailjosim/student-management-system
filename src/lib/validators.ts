import { z } from 'zod';

// Student Schemas
export const StudentCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  enrollmentDate: z.string().or(z.date()),
  status: z.enum(['active', 'inactive', 'graduated', 'dropped']).optional(),
  currentGrade: z.number().min(0).max(100).optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const StudentUpdateSchema = StudentCreateSchema.partial();

// Assignment Schemas
export const AssignmentCreateSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().or(z.date()),
  status: z.enum(['pending', 'submitted', 'graded', 'overdue']).optional(),
});

export const AssignmentUpdateSchema = AssignmentCreateSchema.partial();

// CallLog Schemas
export const CallLogCreateSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  callDate: z.string().or(z.date()),
  duration: z.number().min(0, 'Duration must be positive'),
  notes: z.string().min(1, 'Notes are required'),
  nextCallDate: z.string().or(z.date()).optional(),
  status: z.enum(['completed', 'missed', 'scheduled']).optional(),
  callType: z.enum(['phone', 'video', 'message']),
});

export const CallLogUpdateSchema = CallLogCreateSchema.partial();

// FollowUp Schemas
export const FollowUpCreateSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().or(z.date()),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const FollowUpUpdateSchema = FollowUpCreateSchema.partial();

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

export type StudentCreate = z.infer<typeof StudentCreateSchema>;
export type StudentUpdate = z.infer<typeof StudentUpdateSchema>;
export type AssignmentCreate = z.infer<typeof AssignmentCreateSchema>;
export type AssignmentUpdate = z.infer<typeof AssignmentUpdateSchema>;
export type CallLogCreate = z.infer<typeof CallLogCreateSchema>;
export type CallLogUpdate = z.infer<typeof CallLogUpdateSchema>;
export type FollowUpCreate = z.infer<typeof FollowUpCreateSchema>;
export type FollowUpUpdate = z.infer<typeof FollowUpUpdateSchema>;
