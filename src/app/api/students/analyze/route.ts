/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, logger } from '@/lib/utils';
import Student from '@/models/Student';
import { Settings } from '@/models/Settings';
import { NextRequest, NextResponse } from 'next/server';

const formatAssignmentKey = (assignmentNumber: number) =>
  `A-${String(assignmentNumber).padStart(2, '0')}`;

const parseAssignmentNumber = (assignment: string | undefined) => {
  if (!assignment) return null;

  const assignmentNumber = parseInt(assignment.split('-')[1], 10);

  return Number.isNaN(assignmentNumber) ? null : assignmentNumber;
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { assignmentNumber } = body;

    // Validate assignment number
    if (!assignmentNumber || assignmentNumber < 1 || assignmentNumber > 10) {
      return NextResponse.json(
        createResponse(400, 'Invalid assignment number. Must be between 1 and 10'),
        { status: 400 }
      );
    }

    const currentAssignment = formatAssignmentKey(assignmentNumber);

    await Settings.findOneAndUpdate(
      {},
      { currentAssignment },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Get all students
    const students = await Student.find().lean();

    let completedCount = 0;
    let notCompletedCount = 0;
    let updatedCount = 0;
    const studentDetails: any[] = [];

    // Process each student
    for (const student of students) {
      try {
        // Get the specific assignment from embedded array
        const assignment = student.assignments?.find(
          (a: any) => a.assignmentNumber === assignmentNumber
        );

        const isCompleted =
          assignment?.status === 'COMPLETED' || assignment?.status === 'SUBMITTED';
        const previousStatus = student.currentStatus || 'On Track';
        const newStatus = isCompleted ? 'On Track' : 'Behind';
        const updateData: Record<string, string> = {
          currentStatus: newStatus,
        };

        if (isCompleted) {
          completedCount++;

          const lastCompletedNumber = parseAssignmentNumber(student.lastCompletedAssignment);

          if (!lastCompletedNumber || assignmentNumber > lastCompletedNumber) {
            updateData.lastCompletedAssignment = currentAssignment;
          }
        } else {
          notCompletedCount++;
        }

        const shouldUpdate =
          previousStatus !== newStatus || updateData.lastCompletedAssignment !== undefined;

        if (shouldUpdate) {
          await Student.findByIdAndUpdate(student._id, updateData);
          updatedCount++;
        }

        studentDetails.push({
          id: student._id.toString(),
          name: student.name,
          completed: isCompleted,
          previousStatus,
          newStatus,
        });
      } catch (error) {
        logger.error(`Error processing student ${student._id}`, error);
        // Continue processing other students
      }
    }

    logger.info('Analyze students completed', {
      assignmentNumber,
      completedCount,
      notCompletedCount,
      updatedCount,
    });

    const result = {
      totalStudents: students.length,
      completedAssignment: assignmentNumber,
      currentAssignment,
      completedCount,
      notCompletedCount,
      updatedCount,
      students: studentDetails,
    };

    const response = createResponse(
      200,
      `Analysis completed. ${updatedCount} students updated.`,
      result
    );
    return NextResponse.json(response);
  } catch (error) {
    logger.error('POST /api/students/analyze - Failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
