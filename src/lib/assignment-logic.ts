/* eslint-disable @typescript-eslint/no-explicit-any */
import Student from '@/models/Student';
import { StudentStatus, StudentAssignment } from '@/models/Student';

/**
 * Get the current active assignment number based on today's date
 * Assuming assignments are released one per week, starting from a baseline date
 */
export function getCurrentActiveAssignment(): number {
  const baselineDate = new Date('2024-01-01');
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

    const assignments = student.assignments.sort(
      (a: any, b: any) => a.assignmentNumber - b.assignmentNumber
    );
    if (assignments.length < 2) return false;

    let consecutiveMissed = 0;
    for (const assignment of assignments) {
      if (assignment.status === 'PENDING') {
        consecutiveMissed++;
        if (consecutiveMissed >= 2) return true;
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
 */
export async function estimateCompletionDate(studentId: string): Promise<Date | null> {
  try {
    const behind = await getAssignmentsBehind(studentId);
    if (behind <= 0) {
      const student = await Student.findById(studentId).lean();
      const completed =
        student?.assignments?.filter((a: any) => a.status === 'COMPLETED').length || 0;
      if (completed >= 10) return new Date();
    }

    const estimatedWeeks = Math.ceil((10 - behind) * 1.2);
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
 */
export async function updateStudentStatus(studentId: string): Promise<StudentStatus> {
  try {
    const student = await Student.findById(studentId);
    if (!student) return 'On Track';

    const assignments = student.assignments || [];
    const completedCount = assignments.filter(
      (a: StudentAssignment) => a.status === 'COMPLETED'
    ).length;

    if (completedCount >= 10) {
      student.currentStatus = 'Completed';
      await student.save();
      return 'Completed';
    }

    const isFailing = await detectFailingStudent(studentId);
    if (isFailing) {
      student.currentStatus = 'At Risk';
      await student.save();
      return 'At Risk';
    }

    const behind = await getAssignmentsBehind(studentId);
    if (behind >= 2) {
      student.currentStatus = 'Behind';
      await student.save();
      return 'Behind';
    }

    student.currentStatus = 'On Track';
    await student.save();
    return 'On Track';
  } catch (error) {
    console.error('Error updating student status:', error);
    return 'On Track';
  }
}

/**
 * Submit an assignment (status: PENDING → SUBMITTED)
 */
export async function submitAssignment(
  studentId: string,
  assignmentNumber: number,
  submittedDate?: Date
): Promise<any> {
  try {
    const student = await Student.findById(studentId);
    if (!student) return null;

    if (!student.assignments) student.assignments = [];

    const assignmentIndex = student.assignments.findIndex(
      (a: StudentAssignment) => a.assignmentNumber === assignmentNumber
    );
    if (assignmentIndex < 0) {
      student.assignments.push({
        assignmentNumber: assignmentNumber,
        status: 'SUBMITTED',
        submittedDate: submittedDate || new Date(),
      });
      student.assignments.sort(
        (a: StudentAssignment, b: StudentAssignment) => a.assignmentNumber - b.assignmentNumber
      );
    } else {
      student.assignments[assignmentIndex] = {
        ...student.assignments[assignmentIndex],
        status: 'SUBMITTED',
        submittedDate: submittedDate || new Date(),
      };
    }

    const assignmentKey = `A-${String(assignmentNumber).padStart(2, '0')}`;
    const currentLast = student.lastCompletedAssignment || 'None';
    if (currentLast === 'None' || parseInt(currentLast.split('-')[1]) < assignmentNumber) {
      student.lastCompletedAssignment = assignmentKey;
    }

    await student.save();
    await updateStudentStatus(studentId);

    return (
      student.assignments[assignmentIndex] || student.assignments[student.assignments.length - 1]
    );
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
}

/**
 * Complete an assignment (status: → COMPLETED)
 */
export async function completeAssignment(
  studentId: string,
  assignmentNumber: number,
  completedDate?: Date
): Promise<any> {
  try {
    const student = await Student.findById(studentId);
    if (!student) return null;

    if (!student.assignments) student.assignments = [];

    const assignmentIndex = student.assignments.findIndex(
      (a: StudentAssignment) => a.assignmentNumber === assignmentNumber
    );
    if (assignmentIndex < 0) {
      student.assignments.push({
        assignmentNumber: assignmentNumber,
        status: 'COMPLETED',
        completedDate: completedDate || new Date(),
      });
      student.assignments.sort(
        (a: StudentAssignment, b: StudentAssignment) => a.assignmentNumber - b.assignmentNumber
      );
    } else {
      student.assignments[assignmentIndex] = {
        ...student.assignments[assignmentIndex],
        status: 'COMPLETED',
        completedDate: completedDate || new Date(),
      };
    }

    const assignmentKey = `A-${String(assignmentNumber).padStart(2, '0')}`;
    const currentLast = student.lastCompletedAssignment || 'None';
    if (currentLast === 'None' || parseInt(currentLast.split('-')[1]) < assignmentNumber) {
      student.lastCompletedAssignment = assignmentKey;
    }

    await student.save();
    await updateStudentStatus(studentId);

    return (
      student.assignments[assignmentIndex] || student.assignments[student.assignments.length - 1]
    );
  } catch (error) {
    console.error('Error completing assignment:', error);
    throw error;
  }
}

/**
 * Validate assignment state progression
 */
export function validateStatusProgression(currentStatus: string, newStatus: string): boolean {
  const validProgression: Record<string, string[]> = {
    PENDING: ['SUBMITTED', 'COMPLETED'],
    SUBMITTED: ['COMPLETED', 'PENDING'],
    COMPLETED: ['SUBMITTED'],
  };
  return validProgression[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Calculate assignment statistics across all students
 */
export async function calculateAssignmentStats(ownerId: string): Promise<any> {
  try {
    const assignmentStats: any[] = [];

    for (let i = 1; i <= 10; i++) {
      const stats = await Student.aggregate([
        { $match: { ownerId } },
        { $unwind: '$assignments' },
        { $match: { 'assignments.assignmentNumber': i } },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            submitted: {
              $sum: { $cond: [{ $in: ['$assignments.status', ['SUBMITTED', 'COMPLETED']] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$assignments.status', 'COMPLETED'] }, 1, 0] },
            },
          },
        },
      ]);

      const statData = stats[0] || { totalStudents: 0, submitted: 0, completed: 0 };
      const pending = statData.totalStudents - statData.submitted;
      const submissionRate =
        statData.totalStudents > 0
          ? (((statData.submitted + statData.completed) / statData.totalStudents) * 100).toFixed(2)
          : '0';

      assignmentStats.push({
        assignmentNumber: i,
        totalStudents: statData.totalStudents,
        submitted: statData.submitted,
        completed: statData.completed,
        pending,
        submissionRate: `${submissionRate}%`,
      });
    }

    const overallStats = await Student.aggregate([
      { $match: { ownerId } },
      { $unwind: { path: '$assignments', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          completedAssignments: {
            $sum: { $cond: [{ $eq: ['$assignments.status', 'COMPLETED'] }, 1, 0] },
          },
          submittedAssignments: {
            $sum: { $cond: [{ $in: ['$assignments.status', ['SUBMITTED', 'COMPLETED']] }, 1, 0] },
          },
        },
      },
    ]);

    const overall = overallStats[0] || {
      totalAssignments: 0,
      completedAssignments: 0,
      submittedAssignments: 0,
    };

    const averageProgress =
      overall.totalAssignments > 0
        ? ((overall.submittedAssignments / overall.totalAssignments) * 100).toFixed(2)
        : '0';

    return {
      assignmentStats,
      averageProgress: `${averageProgress}%`,
      totalAssignmentsCompleted: overall.completedAssignments,
      totalSubmitted: overall.submittedAssignments,
      totalPending: overall.totalAssignments - overall.submittedAssignments,
    };
  } catch (error) {
    console.error('Error calculating assignment stats:', error);
    throw error;
  }
}

/**
 * Get submission timeline data
 */
export async function getSubmissionTimeline(
  ownerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<any> {
  try {
    const pipeline: any[] = [
      { $match: { ownerId } },
      { $unwind: { path: '$assignments', preserveNullAndEmptyArrays: false } },
      {
        $match: {
          'assignments.status': { $in: ['SUBMITTED', 'COMPLETED'] },
        },
      },
    ];

    if (startDate || endDate) {
      const dateMatch: any = {};
      if (startDate) dateMatch.$gte = startDate;
      if (endDate) dateMatch.$lte = endDate;
      pipeline.push({
        $match: {
          'assignments.date': dateMatch,
        },
      });
    }

    pipeline.push({
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $ifNull: ['$assignments.date', '$assignments.date'],
            },
          },
        },
        count: { $sum: 1 },
      },
    });

    pipeline.push({ $sort: { _id: -1 } });

    const timeline = await Student.aggregate(pipeline);
    const totalSubmissions = timeline.reduce((sum: number, item: any) => sum + item.count, 0);

    return {
      timeline: timeline.map((item: any) => ({
        date: item._id || 'No Date',
        submissions: item.count,
      })),
      totalSubmissions,
    };
  } catch (error) {
    console.error('Error getting submission timeline:', error);
    throw error;
  }
}
