/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, logger } from '@/lib/utils';
import Student from '@/models/Student';
import Assignment from '@/models/Assignment';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get all students
    const students = await Student.find().lean();

    const updates: any[] = [];
    let updatedCount = 0;

    // Process each student
    for (const student of students) {
      try {
        // Get all assignments for this student
        const assignments = await Assignment.find({ studentId: student._id }).lean();

        // Count incomplete assignments
        const incompleteCount = assignments.filter(
          (a) => a.status !== 'COMPLETED' && a.status !== 'SUBMITTED'
        ).length;

        let newStatus = student.currentStatus || 'On Track';

        // Rule 1: If more than 2 assignments not completed → At Risk
        if (incompleteCount > 2) {
          newStatus = 'At Risk';
        } else {
          // Rule 2: If current assignment not completed → Behind
          const lastCompleted = student.lastCompletedAssignment;
          if (lastCompleted && lastCompleted !== 'None') {
            const lastCompletedNum = parseInt(lastCompleted.split('-')[1]);
            const currentAssignmentNum = lastCompletedNum + 1;

            const currentAssignment = assignments.find(
              (a) => a.assignmentNumber === currentAssignmentNum
            );

            if (
              currentAssignment &&
              currentAssignment.status !== 'COMPLETED' &&
              currentAssignment.status !== 'SUBMITTED'
            ) {
              newStatus = 'Behind';
            } else {
              newStatus = 'On Track';
            }
          }
        }

        // Only update if status changed
        if (newStatus !== student.currentStatus) {
          await Student.findByIdAndUpdate(student._id, { currentStatus: newStatus });
          updates.push({
            studentId: student._id,
            studentName: student.name,
            oldStatus: student.currentStatus || 'On Track',
            newStatus,
          });
          updatedCount++;
        }
      } catch (error) {
        logger.error(`Error processing student ${student._id}`, error);
        // Continue processing other students
      }
    }

    logger.info('Auto-detect student statuses completed', {
      updatedCount,
      totalStudents: students.length,
    });

    const response = createResponse(
      200,
      `Auto-detection completed. ${updatedCount} students updated.`,
      { updatedCount, totalStudents: students.length, updates }
    );
    return NextResponse.json(response);
  } catch (error) {
    logger.error('POST /api/students/auto-detect - Failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
