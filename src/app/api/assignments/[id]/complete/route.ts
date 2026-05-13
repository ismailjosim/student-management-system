import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, isValidObjectId, logger } from '@/lib/utils';
import { completeAssignment } from '@/lib/assignment-logic';
import Assignment from '@/models/Assignment';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(createResponse(400, 'Invalid assignment ID format'), {
        status: 400,
      });
    }

    const body = await request.json();
    const { completedDate } = body;

    // Validate date if provided
    if (completedDate) {
      const date = new Date(completedDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(createResponse(400, 'Invalid date format'), { status: 400 });
      }
      if (date > new Date()) {
        return NextResponse.json(createResponse(400, 'Date cannot be in the future'), {
          status: 400,
        });
      }
    }

    const assignment = await completeAssignment(
      id,
      completedDate ? new Date(completedDate) : undefined
    );

    if (!assignment) {
      return NextResponse.json(createResponse(404, 'Assignment not found'), { status: 404 });
    }

    // Fetch the assignment again to populate student info
    const populatedAssignment = await Assignment.findById(id).populate(
      'studentId',
      'name email phone'
    );

    logger.info('PUT /api/assignments/[id]/complete', { assignmentId: id });

    const response = createResponse(
      200,
      'Assignment marked as completed successfully',
      populatedAssignment
    );
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('PUT /api/assignments/[id]/complete failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
