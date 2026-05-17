import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, isValidObjectId, logger } from '@/lib/utils';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: studentId } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(studentId)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), {
        status: 400,
      });
    }

    const body = await request.json();
    const { assignmentNumber, date } = body;

    // Validate assignment number
    if (!assignmentNumber || assignmentNumber < 1 || assignmentNumber > 10) {
      return NextResponse.json(createResponse(400, 'Assignment number must be between 1 and 10'), {
        status: 400,
      });
    }

    // Validate date if provided
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(createResponse(400, 'Invalid date format'), { status: 400 });
      }
      if (dateObj > new Date()) {
        return NextResponse.json(createResponse(400, 'Date cannot be in the future'), {
          status: 400,
        });
      }
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // Initialize assignments array if needed
    if (!student.assignments) {
      student.assignments = [];
    }

    // Find or create the embedded assignment
    const assignmentIndex = student.assignments.findIndex(
      (a) => a.assignmentNumber === assignmentNumber
    );

    if (assignmentIndex >= 0) {
      // Update existing embedded assignment
      student.assignments[assignmentIndex] = {
        assignmentNumber,
        status: 'SUBMITTED',
        date: date ? new Date(date) : new Date(),
      };
    } else {
      // Add new embedded assignment
      student.assignments.push({
        assignmentNumber,
        status: 'SUBMITTED',
        date: date ? new Date(date) : new Date(),
      });
    }

    // Update lastCompletedAssignment if needed
    const assignmentKey = `A-${String(assignmentNumber).padStart(2, '0')}`;
    const currentLast = student.lastCompletedAssignment || 'None';
    if (currentLast === 'None' || parseInt(currentLast.split('-')[1]) < assignmentNumber) {
      student.lastCompletedAssignment = assignmentKey;
    }

    await student.save();

    logger.info('PUT /api/assignments/[id]/submit', { studentId, assignmentNumber });

    const response = createResponse(200, 'Assignment marked as submitted successfully', {
      studentId,
      assignmentNumber,
      assignment:
        student.assignments[assignmentIndex] || student.assignments[student.assignments.length - 1],
    });
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('PUT /api/assignments/[id]/submit failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
