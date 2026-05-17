/* eslint-disable @typescript-eslint/no-explicit-any */
import Assignment from '@/models/Assignment';
import Student from '@/models/Student';

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
 * Update student's assignments array from Assignment collection
 * Stores only completed assignments in the format ['A-05','A-06'...]
 */
export async function updateStudentAssignments(studentId: string): Promise<string[]> {
  try {
    // Get all completed assignments for this student
    const assignments = await Assignment.find({
      studentId,
      status: 'COMPLETED',
    })
      .sort({ assignmentNumber: 1 })
      .lean();

    // Format as ['A-05','A-06'...] array
    const assignmentIds = assignments.map((a: any) =>
      formatAssignmentId(a.assignmentNumber)
    );

    // Update student record
    await Student.findByIdAndUpdate(studentId, {
      assignments: assignmentIds,
    });

    return assignmentIds;
  } catch (error) {
    console.error('Error updating student assignments:', error);
    return [];
  }
}

/**
 * Get formatted assignments for a student
 */
export async function getStudentAssignments(studentId: string): Promise<string[]> {
  try {
    const student = await Student.findById(studentId).lean();
    return student?.assignments || [];
  } catch (error) {
    console.error('Error getting student assignments:', error);
    return [];
  }
}

/**
 * Add assignment to student's array (only if COMPLETED)
 */
export async function addAssignmentToStudent(
  studentId: string,
  assignmentNumber: number,
  status: string
): Promise<void> {
  try {
    if (status !== 'COMPLETED') return;

    const assignmentId = formatAssignmentId(assignmentNumber);
    const student = await Student.findById(studentId).lean();
    const currentAssignments = student?.assignments || [];

    // Avoid duplicates
    if (!currentAssignments.includes(assignmentId)) {
      currentAssignments.push(assignmentId);
      // Sort by assignment number
      currentAssignments.sort(
        (a, b) => parseAssignmentId(a) - parseAssignmentId(b)
      );

      await Student.findByIdAndUpdate(studentId, {
        assignments: currentAssignments,
      });
    }
  } catch (error) {
    console.error('Error adding assignment to student:', error);
  }
}

/**
 * Remove assignment from student's array
 */
export async function removeAssignmentFromStudent(
  studentId: string,
  assignmentNumber: number
): Promise<void> {
  try {
    const assignmentId = formatAssignmentId(assignmentNumber);
    const student = await Student.findById(studentId).lean();
    const currentAssignments = student?.assignments || [];

    const updated = currentAssignments.filter((a) => a !== assignmentId);

    await Student.findByIdAndUpdate(studentId, {
      assignments: updated,
    });
  } catch (error) {
    console.error('Error removing assignment from student:', error);
  }
}

/**
 * Sync all students' assignment arrays from Assignment collection
 * Useful for bulk updates or data migration
 */
export async function syncAllStudentAssignments(): Promise<number> {
  try {
    const students = await Student.find().lean();
    let updated = 0;

    for (const student of students) {
      const assignments = await Assignment.find({
        studentId: student._id,
        status: 'COMPLETED',
      })
        .sort({ assignmentNumber: 1 })
        .lean();

      const assignmentIds = assignments.map((a: any) =>
        formatAssignmentId(a.assignmentNumber)
      );

      if (JSON.stringify(assignmentIds) !== JSON.stringify(student.assignments)) {
        await Student.findByIdAndUpdate(student._id, {
          assignments: assignmentIds,
        });
        updated++;
      }
    }

    return updated;
  } catch (error) {
    console.error('Error syncing student assignments:', error);
    return 0;
  }
}
