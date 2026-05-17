/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, logger } from '@/lib/utils';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';

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

        if (isCompleted) {
          completedCount++;
        } else {
          notCompletedCount++;

          // If assignment not completed, set status to 'Behind'
          const currentStatus = student.currentStatus || 'On Track';
          if (
            currentStatus !== 'Behind' &&
            currentStatus !== 'Dropped' &&
            currentStatus !== 'Completed'
          ) {
            await Student.findByIdAndUpdate(student._id, { currentStatus: 'Behind' });
            updatedCount++;

            studentDetails.push({
              id: student._id.toString(),
              name: student.name,
              completed: false,
              previousStatus: currentStatus,
              newStatus: 'Behind',
            });
          } else {
            studentDetails.push({
              id: student._id.toString(),
              name: student.name,
              completed: false,
              previousStatus: currentStatus,
              newStatus: currentStatus,
            });
          }
        }

        if (isCompleted) {
          studentDetails.push({
            id: student._id.toString(),
            name: student.name,
            completed: true,
            previousStatus: student.currentStatus || 'On Track',
            newStatus: student.currentStatus || 'On Track',
          });
        }
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
