/* eslint-disable @typescript-eslint/no-explicit-any */
import { Assignment } from '@/interfaces/assignment.interface';
import Student from '@/models/Student';
import { StudentStatus } from '@/models/Student';
import { updateStudentAssignments } from './assignment-formatter';

/**
 * Get the current active assignment number based on today's date
 * Assuming assignments are released one per week, starting from a baseline date
 */
export function getCurrentActiveAssignment(): number {
  const baselineDate = new Date('2024-01-01'); // When assignment 1 was released
  const today = new Date();
  const weeksElapsed = Math.floor(
    (today.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const currentAssignment = Math.min(weeksElapsed + 1, 10);
  return Math.max(1, currentAssignment);
}

/**
 * Detect if a student is failing (2+ consecutive assignments missed)
 */
export async function detectFailingStudent(studentId: string): Promise<boolean> {
  try {
    const student = await Student.findById(studentId).lean();
    if (!student || !student.assignments) return false;

    // Sort by assignment number
    const assignments = student.assignments.sort((a: any, b: any) => a.assignment - b.assignment);

    if (assignments.length < 2) return false;

    let consecutiveMissed = 0;

    for (const assignment of assignments) {
      if (assignment.status === 'PENDING') {
        consecutiveMissed++;
        if (consecutiveMissed >= 2) {
          return true;
        }
      } else {
        consecutiveMissed = 0;
      }
    }

    return false;
  } catch (error) {
    console.error('Error detecting failing student:', error);
    return false;
  }
}

/**
 * Count how many assignments a student is behind
 */
export async function getAssignmentsBehind(studentId: string): Promise<number> {
  try {
    const currentActive = getCurrentActiveAssignment();
    const student = await Student.findById(studentId).lean();

    if (!student) return 0;

    const lastCompleted = student.lastCompletedAssignment;
    if (lastCompleted === 'None') return currentActive - 1;

    const lastNumber = parseInt(lastCompleted.split('-')[1], 10);
    return Math.max(0, currentActive - lastNumber - 1);
  } catch (error) {
    console.error('Error calculating assignments behind:', error);
    return 0;
  }
}

/**
 * Estimate when student will complete all assignments
 * Assumes one assignment per week
 */
export async function estimateCompletionDate(studentId: string): Promise<Date | null> {
  try {
    const behind = await getAssignmentsBehind(studentId);
    if (behind <= 0) {
      // Check if all assignments are completed
      const student = await Student.findById(studentId).lean();
      const completed = student?.assignments?.filter((a: any) => a.status === 'COMPLETED').length || 0;

      if (completed >= 10) {
        return new Date(); // Already completed
      }
    }

    const estimatedWeeks = Math.ceil((10 - behind) * 1.2); // 1.2 factor for safety
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedWeeks * 7);

    return estimatedDate;
  } catch (error) {
    console.error('Error estimating completion date:', error);
    return null;
  }
}

/**
 * Update student status based on assignment progress
 * Logic:
 * - If all assignments completed → COMPLETED
 * - If 2+ missed consecutive → AT RISK
 * - If behind by 2+ → BEHIND
 * - Otherwise → ON TRACK
 */
export async function updateStudentStatus(studentId: string): Promise<StudentStatus> {
  try {
    const [assignments, isFailing, behind] = await Promise.all([
      Assignment.find({ studentId }).lean(),
      detectFailingStudent(studentId),
      getAssignmentsBehind(studentId),
    ]);

    const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;

    // All assignments completed
    if (completedCount >= 10) {
      await Student.findByIdAndUpdate(studentId, { currentStatus: 'Completed' });
      return 'Completed';
    }

    // Failing student (2+ consecutive missed)
    if (isFailing) {
      await Student.findByIdAndUpdate(studentId, { currentStatus: 'At Risk' });
      return 'At Risk';
    }

    // Behind by 2+ assignments
    if (behind >= 2) {
      await Student.findByIdAndUpdate(studentId, { currentStatus: 'Behind' });
      return 'Behind';
    }

    // On track
    await Student.findByIdAndUpdate(studentId, { currentStatus: 'On Track' });
    return 'On Track';
  } catch (error) {
    console.error('Error updating student status:', error);
    return 'On Track';
  }
}

/**
 * Process assignment submission and cascade updates
 * Updates:
 * 1. Assignment status to SUBMITTED
 * 2. Student lastCompletedAssignment if applicable
 * 3. Student currentStatus based on progress
 */
export async function submitAssignment(assignmentId: string, completedDate?: Date): Promise<any> {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        status: 'SUBMITTED',
        completedDate: completedDate || new Date(),
      },
      { new: true }
    );

    if (!assignment) return null;

    // Update student's lastCompletedAssignment if this is higher
    const student = await Student.findById(assignment.studentId);
    if (student) {
      const assignmentKey = `A-${String(assignment.assignmentNumber).padStart(2, '0')}`;
      const currentLast = student.lastCompletedAssignment || 'None';

      if (
        currentLast === 'None' ||
        parseInt(currentLast.split('-')[1]) < assignment.assignmentNumber
      ) {
        student.lastCompletedAssignment = assignmentKey;
        await student.save();
      }

      // Update student status
      await updateStudentStatus(assignment.studentId.toString());
    }

    return assignment;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
}

/**
 * Process assignment completion and cascade updates
 */
export async function completeAssignment(assignmentId: string, completedDate?: Date): Promise<any> {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        status: 'COMPLETED',
        completedDate: completedDate || new Date(),
      },
      { new: true }
    );

    if (!assignment) return null;

    // Update student's lastCompletedAssignment
    const student = await Student.findById(assignment.studentId);
    if (student) {
      const assignmentKey = `A-${String(assignment.assignmentNumber).padStart(2, '0')}`;
      const currentLast = student.lastCompletedAssignment || 'None';

      if (
        currentLast === 'None' ||
        parseInt(currentLast.split('-')[1]) < assignment.assignmentNumber
      ) {
        student.lastCompletedAssignment = assignmentKey;
        await student.save();
      }

      // Update student's assignments array with new format ['A-05','A-06'...]
      await updateStudentAssignments(assignment.studentId.toString());

      // Update student status
      await updateStudentStatus(assignment.studentId.toString());
    }

    return assignment;
  } catch (error) {
    console.error('Error completing assignment:', error);
    throw error;
  }
}

/**
 * Validate assignment state progression
 * Can't go from PENDING directly to COMPLETED (must go through SUBMITTED)
 */
export function validateStatusProgression(currentStatus: string, newStatus: string): boolean {
  const validProgression: Record<string, string[]> = {
    NOT_DEFINED: ['PENDING', 'SUBMITTED', 'COMPLETED'],
    PENDING: ['SUBMITTED', 'COMPLETED'],
    SUBMITTED: ['COMPLETED', 'PENDING'],
    COMPLETED: ['SUBMITTED'], // Allow resetting if needed
  };

  return validProgression[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Calculate assignment statistics across all students
 */
export async function calculateAssignmentStats(): Promise<any> {
  try {
    const assignmentStats: any[] = [];

    for (let i = 1; i <= 10; i++) {
      const total = await Assignment.countDocuments({ assignmentNumber: i });
      const submitted = await Assignment.countDocuments({
        assignmentNumber: i,
        status: 'SUBMITTED',
      });
      const completed = await Assignment.countDocuments({
        assignmentNumber: i,
        status: 'COMPLETED',
      });
      const pending = total - submitted;

      const submissionRate = total > 0 ? (((submitted + completed) / total) * 100).toFixed(2) : '0';

      assignmentStats.push({
        assignmentNumber: i,
        totalStudents: total,
        submitted,
        completed,
        pending,
        submissionRate: `${submissionRate}%`,
      });
    }

    // Calculate overall progress
    const totalAssignments = await Assignment.countDocuments();
    const completedAssignments = await Assignment.countDocuments({ status: 'COMPLETED' });
    const submittedAssignments = await Assignment.countDocuments({
      status: { $in: ['SUBMITTED', 'COMPLETED'] },
    });

    const averageProgress =
      totalAssignments > 0 ? ((submittedAssignments / totalAssignments) * 100).toFixed(2) : '0';

    return {
      assignmentStats,
      averageProgress: `${averageProgress}%`,
      totalAssignmentsCompleted: completedAssignments,
      totalSubmitted: submittedAssignments,
      totalPending: totalAssignments - submittedAssignments,
    };
  } catch (error) {
    console.error('Error calculating assignment stats:', error);
    throw error;
  }
}

/**
 * Get submission timeline data (grouped by date)
 */
export async function getSubmissionTimeline(startDate?: Date, endDate?: Date): Promise<any> {
  try {
    const query: any = { status: { $in: ['SUBMITTED', 'COMPLETED'] } };

    if (startDate || endDate) {
      query.completedDate = {};
      if (startDate) query.completedDate.$gte = startDate;
      if (endDate) query.completedDate.$lte = endDate;
    }

    const assignments = await Assignment.find(query).sort({ completedDate: -1 }).lean();

    // Group by date
    const timeline: Record<string, number> = {};

    for (const assignment of assignments) {
      const dateKey = assignment.completedDate
        ? new Date(assignment.completedDate).toISOString().split('T')[0]
        : 'No Date';

      timeline[dateKey] = (timeline[dateKey] || 0) + 1;
    }

    return {
      timeline: Object.entries(timeline).map(([date, count]) => ({
        date,
        submissions: count,
      })),
      totalSubmissions: assignments.length,
    };
  } catch (error) {
    console.error('Error getting submission timeline:', error);
    throw error;
  }
}
