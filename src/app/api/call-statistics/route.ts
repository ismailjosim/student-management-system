import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import { getCallStatistics } from '@/lib/follow-up-logic';
import { requireCurrentUserId } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

/**
 * GET /api/call-statistics
 * Get call analytics and statistics
 */
export async function GET() {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    const statistics = await getCallStatistics(userId);

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
