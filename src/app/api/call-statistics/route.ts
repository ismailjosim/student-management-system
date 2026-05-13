import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import { getCallStatistics } from '@/lib/follow-up-logic';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/call-statistics
 * Get call analytics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const statistics = await getCallStatistics();

    const response = createResponse(200, 'Call statistics fetched successfully', statistics);
    return NextResponse.json(response);
  } catch (error) {
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
