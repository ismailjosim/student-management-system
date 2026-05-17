/* eslint-disable @typescript-eslint/no-explicit-any */

import Student from '@/models/Student';
import type { StudentAssignment } from '@/models/Student';
import { isValidObjectId } from './utils';

/**
 * Format assignment number to assignment ID (e.g., 5 -> 'A-05')
 */
export function formatAssignmentId(assignmentNumber: number): string {
  return `A-${String(assignmentNumber).padStart(2, '0')}`;
}

/**
 * Parse assignment ID to number (e.g., 'A-05' -> 5)
 */
export function parseAssignmentId(assignmentId: string): number {
  return parseInt(assignmentId.replace('A-', ''), 10);
}

/**
 * Get embedded assignments for a student
 */
export async function getStudentAssignments(studentId: string): Promise<StudentAssignment[]> {
  try {
    if (!isValidObjectId(studentId)) return [];
    const student = await Student.findById(studentId).lean();
    return student?.assignments || [];
  } catch (error) {
    console.error('Error getting student assignments:', error);
    return [];
  }
}

/**
 * Update or create an assignment in the student's embedded assignments array
 */
export async function upsertStudentAssignment(
  studentId: string,
  assignmentNumber: number,
  status: string,
  completedDate?: Date,
  submittedDate?: Date
): Promise<StudentAssignment | null> {
  try {
    if (!isValidObjectId(studentId)) return null;

    const student = await Student.findById(studentId);
    if (!student) return null;

    // Initialize assignments array if it doesn't exist
    if (!student.assignments) {
      student.assignments = [];
    }

    // Find existing assignment
    const existingIndex = student.assignments.findIndex(
      (a: any) => a.assignment === assignmentNumber
    );

    const assignmentData: StudentAssignment = {
      assignment: assignmentNumber,
      status: status as 'PENDING' | 'SUBMITTED' | 'COMPLETED',
      completedDate,
      submittedDate,
    };

    if (existingIndex >= 0) {
      // Update existing
      student.assignments[existingIndex] = {
        ...student.assignments[existingIndex],
        ...assignmentData,
      };
    } else {
      // Add new
      student.assignments.push(assignmentData);
      // Sort by assignment number
      student.assignments.sort((a: any, b: any) => a.assignment - b.assignment);
    }

    await student.save();

    return assignmentData;
  } catch (error) {
    console.error('Error upserting student assignment:', error);
    return null;
  }
}

/**
 * Remove an assignment from student's embedded array
 */
export async function removeStudentAssignment(
  studentId: string,
  assignmentNumber: number
): Promise<boolean> {
  try {
    if (!isValidObjectId(studentId)) return false;

    const result = await Student.findByIdAndUpdate(
      studentId,
      {
        $pull: { assignments: { assignment: assignmentNumber } },
      },
      { new: true }
    );

    return !!result;
  } catch (error) {
    console.error('Error removing student assignment:', error);
    return false;
  }
}

/**
 * Get assignment count statistics
 */
export async function getAssignmentStats(studentId: string) {
  try {
    if (!isValidObjectId(studentId)) return null;

    const student = await Student.findById(studentId).lean();
    if (!student?.assignments) {
      return {
        total: 0,
        pending: 0,
        submitted: 0,
        completed: 0,
      };
    }

    const assignments = student.assignments;
    return {
      total: assignments.length,
      pending: assignments.filter((a: any) => a.status === 'PENDING').length,
      submitted: assignments.filter((a: any) => a.status === 'SUBMITTED').length,
      completed: assignments.filter((a: any) => a.status === 'COMPLETED').length,
    };
  } catch (error) {
    console.error('Error getting assignment stats:', error);
    return null;
  }
}

/**
 * Get the last completed assignment number
 */
export async function getLastCompletedAssignmentNumber(studentId: string): Promise<number | null> {
  try {
    if (!isValidObjectId(studentId)) return null;

    const student = await Student.findById(studentId).lean();
    if (!student?.assignments) return null;

    const completed = student.assignments
      .filter((a: any) => a.status === 'COMPLETED')
      .sort((a: any, b: any) => b.assignment - a.assignment);

    return completed.length > 0 ? completed[0].assignment : null;
  } catch (error) {
    console.error('Error getting last completed assignment:', error);
    return null;
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use upsertStudentAssignment instead
 */
export async function addAssignmentToStudent(
  studentId: string,
  assignmentNumber: number,
  status: string
): Promise<void> {
  await upsertStudentAssignment(studentId, assignmentNumber, status);
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use removeStudentAssignment instead
 */
export async function removeAssignmentFromStudent(
  studentId: string,
  assignmentNumber: number
): Promise<void> {
  await removeStudentAssignment(studentId, assignmentNumber);
}

/**
 * Legacy function for backward compatibility
 * @deprecated This function no longer syncs from separate Assignment collection
 */
export async function syncAllStudentAssignments(): Promise<number> {
  console.warn('syncAllStudentAssignments is deprecated - assignments are now embedded in Student');
  return 0;
}
