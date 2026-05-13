import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, logger } from '@/lib/utils';
import { calculateAssignmentStats } from '@/lib/assignment-logic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const stats = await calculateAssignmentStats();

    logger.info('GET /api/assignments/stats');

    const response = createResponse(200, 'Assignment statistics fetched successfully', stats);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/assignments/stats failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
