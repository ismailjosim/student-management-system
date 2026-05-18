import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, isValidObjectId, logger } from '@/lib/utils';
import Student from '@/models/Student';
import type { StudentAssignment } from '@/models/Student';
import { requireCurrentUserId } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;
    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    // Get student details
    const student = await Student.findOne({ _id: id, ownerId: userId }).lean();
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // Get assignments from embedded array
    const assignments = student.assignments || [];

    // Calculate statistics
    const submitted = assignments.filter((a: StudentAssignment) => a.status === 'SUBMITTED').length;
    const completed = assignments.filter((a: StudentAssignment) => a.status === 'COMPLETED').length;
    const pending = assignments.filter((a: StudentAssignment) => a.status === 'PENDING').length;
    const totalAssignments = assignments.length;

    // Calculate percentage complete
    const percentComplete =
      totalAssignments > 0 ? Math.round(((submitted + completed) / totalAssignments) * 100) : 0;

    // Find next assignment to complete
    const nextAssignment = assignments.find((a: StudentAssignment) => a.status !== 'COMPLETED');
    const nextAssignmentDue = nextAssignment
      ? `A-${String(nextAssignment.assignmentNumber).padStart(2, '0')}`
      : null;

    // Build assignment list with details
    const assignmentsList = assignments.map((a: StudentAssignment) => ({
      number: a.assignmentNumber,
      status: a.status,
      date: a.date ? new Date(a.date).toISOString().split('T')[0] : null,
    }));

    const progressData = {
      studentId: student._id.toString(),
      name: student.name,
      email: student.email,
      totalAssignments,
      submitted,
      completed,
      pending,
      percentComplete: `${percentComplete}%`,
      lastCompletedAssignment: student.lastCompletedAssignment || 'None',
      nextAssignmentDue,
      currentStatus: student.currentStatus || 'On Track',
      assignments: assignmentsList,
    };

    logger.info('GET /api/students/[id]/progress', { studentId: id });

    const response = createResponse(200, 'Student progress fetched successfully', progressData);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/students/[id]/progress failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
