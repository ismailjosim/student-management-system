import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, isValidObjectId, logger } from '@/lib/utils';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/assignments/[id]
 * Disabled - assignments are now embedded in students
 * Use GET /api/students/[id] instead
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // Check if this is a student ID with queryParam for assignmentNumber
    const { searchParams } = new URL(request.url);
    const assignmentNumber = searchParams.get('assignmentNumber');

    if (!isValidObjectId(id)) {
      return NextResponse.json(createResponse(400, 'Invalid ID format'), { status: 400 });
    }

    // Assume it's a student ID
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // If looking for specific assignment
    if (assignmentNumber) {
      const num = parseInt(assignmentNumber);
      const assignment = student.assignments?.find((a) => a.assignmentNumber === num);

      if (!assignment) {
        return NextResponse.json(createResponse(404, 'Assignment not found for this student'), {
          status: 404,
        });
      }

      return NextResponse.json(
        createResponse(200, 'Assignment fetched successfully', {
          student: { _id: student._id, name: student.name, email: student.email },
          assignment,
        })
      );
    }

    // Return all assignments for student
    const response = createResponse(200, 'Assignments fetched successfully', {
      student: { _id: student._id, name: student.name, email: student.email },
      assignments: student.assignments || [],
    });
    return NextResponse.json(response);
  } catch (error) {
    logger.error('GET /api/assignments/[id] - Failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}

/**
 * PUT /api/assignments/[studentId]?assignmentNumber=1
 * Update embedded assignment
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const assignmentNumber = searchParams.get('assignmentNumber');

    if (!assignmentNumber) {
      return NextResponse.json(createResponse(400, 'Assignment number is required'), {
        status: 400,
      });
    }

    const assignNum = parseInt(assignmentNumber);
    if (isNaN(assignNum) || assignNum < 1 || assignNum > 10) {
      return NextResponse.json(createResponse(400, 'Invalid assignment number (must be 1-10)'), {
        status: 400,
      });
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID'), { status: 400 });
    }

    const body = await request.json();
    const student = await Student.findById(id);

    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    const assignmentIndex = student.assignments?.findIndex((a) => a.assignmentNumber === assignNum);

    if (assignmentIndex === undefined || assignmentIndex < 0) {
      return NextResponse.json(createResponse(404, 'Assignment not found for this student'), {
        status: 404,
      });
    }

    // Update assignment
    student.assignments![assignmentIndex] = {
      ...student.assignments![assignmentIndex],
      status: body.status || student.assignments![assignmentIndex].status,
      date: body.date || student.assignments![assignmentIndex].date,
    };

    await student.save();

    logger.info('PUT /api/assignments - Success', { studentId: id, assignmentNumber: assignNum });
    const response = createResponse(
      200,
      'Assignment updated successfully',
      student.assignments![assignmentIndex]
    );
    return NextResponse.json(response);
  } catch (error) {
    logger.error('PUT /api/assignments - Failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}

/**
 * DELETE /api/assignments/[studentId]?assignmentNumber=1
 * Delete embedded assignment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const assignmentNumber = searchParams.get('assignmentNumber');

    if (!assignmentNumber) {
      return NextResponse.json(createResponse(400, 'Assignment number is required'), {
        status: 400,
      });
    }

    const assignNum = parseInt(assignmentNumber);
    if (isNaN(assignNum) || assignNum < 1 || assignNum > 10) {
      return NextResponse.json(createResponse(400, 'Invalid assignment number (must be 1-10)'), {
        status: 400,
      });
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID'), { status: 400 });
    }

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    const originalLength = student.assignments?.length || 0;
    student.assignments =
      student.assignments?.filter((a) => a.assignmentNumber !== assignNum) || [];

    if (student.assignments.length === originalLength) {
      return NextResponse.json(createResponse(404, 'Assignment not found for this student'), {
        status: 404,
      });
    }

    await student.save();

    logger.info('DELETE /api/assignments - Success', {
      studentId: id,
      assignmentNumber: assignNum,
    });
    const response = createResponse(200, 'Assignment deleted successfully');
    return NextResponse.json(response);
  } catch (error) {
    logger.error('DELETE /api/assignments - Failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
