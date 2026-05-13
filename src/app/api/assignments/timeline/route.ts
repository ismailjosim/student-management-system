import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, logger } from '@/lib/utils';
import { getSubmissionTimeline } from '@/lib/assignment-logic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const assignmentNumber = searchParams.get('assignmentNumber');

    // Parse dates if provided
    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return NextResponse.json(createResponse(400, 'Invalid startDate format'), { status: 400 });
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return NextResponse.json(createResponse(400, 'Invalid endDate format'), { status: 400 });
      }
    }

    const timeline = await getSubmissionTimeline(start, end);

    // Filter by assignment number if provided
    const filteredTimeline = timeline;
    if (assignmentNumber) {
      const num = parseInt(assignmentNumber);
      if (num < 1 || num > 10) {
        return NextResponse.json(
          createResponse(400, 'Assignment number must be between 1 and 10'),
          { status: 400 }
        );
      }

      // Could extend getSubmissionTimeline to support filtering by assignmentNumber
      // For now, returning full timeline
    }

    logger.info('GET /api/assignments/timeline', {
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
      assignmentNumber,
    });

    const response = createResponse(
      200,
      'Submission timeline fetched successfully',
      filteredTimeline
    );
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/assignments/timeline failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
