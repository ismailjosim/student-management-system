/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import {
  createResponse,
  handleDbError,
  handleZodError,
  isValidObjectId,
  logger,
} from '@/lib/utils';
import { UpdateStudentAssignmentSchema } from '@/lib/validators';
import Student from '@/models/Student';
import type { StudentAssignment } from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      logger.info('GET /api/students/[id]/assignments - Invalid ObjectId', { id });
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    // Check if student exists
    const student = await Student.findById(id).lean();
    if (!student) {
      logger.info('GET /api/students/[id]/assignments - Student not found', { id });
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // Get embedded assignments
    const assignments = student.assignments || [];

    // Calculate statistics
    const totalSubmitted = assignments.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'COMPLETED'
    ).length;

    const totalPending = assignments.filter((a) => a.status === 'PENDING').length;
    const totalCompleted = assignments.filter((a) => a.status === 'COMPLETED').length;

    const percentageComplete = assignments.length > 0 ? (totalCompleted / 10) * 100 : 0;

    const stats = {
      totalAssignments: assignments.length,
      totalSubmitted,
      totalPending,
      totalCompleted,
      percentageComplete: Math.round(percentageComplete * 100) / 100,
    };

    logger.info('GET /api/students/[id]/assignments - Success', { id, total: assignments.length });

    const response = createResponse(200, 'Assignments fetched successfully', {
      assignments,
      stats,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/students/[id]/assignments - Failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate student ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    // Check if student exists
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    const body = await request.json();

    // Validate data
    const validatedData = UpdateStudentAssignmentSchema.parse(body);

    // Check for duplicate assignment
    const existing = student.assignments?.some(
      (a) => a.assignmentNumber === validatedData.assignmentNumber
    );

    if (existing) {
      return NextResponse.json(
        createResponse(409, 'Assignment already exists for this student', undefined, [
          {
            field: 'assignmentNumber',
            message: `Student already has assignment ${validatedData.assignmentNumber}`,
          },
        ]),
        { status: 409 }
      );
    }

    // Create new embedded assignment
    const newAssignment: StudentAssignment = {
      assignmentNumber: validatedData.assignmentNumber,
      status: validatedData.status || 'PENDING',
      date: validatedData.date,
    };

    if (!student.assignments) {
      student.assignments = [];
    }

    student.assignments.push(newAssignment);
    // Keep sorted by assignment number
    student.assignments.sort((a, b) => a.assignmentNumber - b.assignmentNumber);

    await student.save();

    logger.info('POST /api/students/[id]/assignments', {
      studentId: id,
      assignmentNumber: validatedData.assignment,
    });

    const response = createResponse(201, 'Assignment created successfully', newAssignment);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const errorData = handleZodError(error as any);
      return NextResponse.json(
        createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
        { status: errorData.statusCode }
      );
    }

    logger.error('POST /api/students/[id]/assignments failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate student ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    const body = await request.json();

    // Validate data (support both old and new field names for backward compatibility)
    const normalizedData = {
      assignmentNumber: body.assignmentNumber || body.assignment,
      status: body.status,
      date: body.date || body.completedDate || body.submittedDate,
    };
    const validatedData = UpdateStudentAssignmentSchema.parse(normalizedData);

    // Find and update assignment
    if (!student.assignments) {
      student.assignments = [];
    }

    const assignmentIndex = student.assignments.findIndex(
      (a) => a.assignmentNumber === validatedData.assignmentNumber
    );

    if (assignmentIndex < 0) {
      return NextResponse.json(createResponse(404, 'Assignment not found for this student'), {
        status: 404,
      });
    }

    // Update assignment
    student.assignments[assignmentIndex] = {
      ...student.assignments[assignmentIndex],
      ...validatedData,
      assignmentNumber: validatedData.assignmentNumber, // Keep original assignment number
    };

    await student.save();

    logger.info('PUT /api/students/[id]/assignments', {
      studentId: id,
      assignmentNumber: validatedData.assignmentNumber,
    });

    const response = createResponse(
      200,
      'Assignment updated successfully',
      student.assignments[assignmentIndex]
    );
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const errorData = handleZodError(error as any);
      return NextResponse.json(
        createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
        { status: errorData.statusCode }
      );
    }

    logger.error('PUT /api/students/[id]/assignments failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate student ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentNumber = searchParams.get('assignmentNumber');

    if (!assignmentNumber) {
      return NextResponse.json(createResponse(400, 'Assignment number is required'), {
        status: 400,
      });
    }

    const assignNum = parseInt(assignmentNumber, 10);
    if (isNaN(assignNum) || assignNum < 1 || assignNum > 10) {
      return NextResponse.json(createResponse(400, 'Invalid assignment number'), { status: 400 });
    }

    const result = await Student.findByIdAndUpdate(
      id,
      { $pull: { assignments: { assignmentNumber: assignNum } } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    logger.info('DELETE /api/students/[id]/assignments', {
      studentId: id,
      assignmentNumber: assignNum,
    });

    const response = createResponse(200, 'Assignment deleted successfully');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('DELETE /api/students/[id]/assignments failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
