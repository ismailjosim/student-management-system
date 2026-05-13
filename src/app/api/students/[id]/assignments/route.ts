import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, isValidObjectId, logger } from '@/lib/utils';
import Assignment from '@/models/Assignment';
import Student from '@/models/Student';
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
    const student = await Student.findById(id);
    if (!student) {
      logger.info('GET /api/students/[id]/assignments - Student not found', { id });
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // Get all assignments for the student
    const assignments = await Assignment.find({ studentId: id })
      .sort({ assignmentNumber: 1 })
      .lean();

    // Calculate statistics
    const totalSubmitted = assignments.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'COMPLETED'
    ).length;

    const totalPending = assignments.filter((a) => a.status === 'PENDING').length;

    const percentageComplete = assignments.length > 0 ? (totalSubmitted / 10) * 100 : 0;

    const stats = {
      totalAssignments: assignments.length,
      totalSubmitted,
      totalPending,
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
