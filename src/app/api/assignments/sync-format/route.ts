import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, logger } from '@/lib/utils';
import { syncAllStudentAssignments } from '@/lib/assignment-formatter';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/assignments/sync-format
 * Migrates existing assignments to the new format ['A-05','A-06'...]
 * This is a one-time migration endpoint
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Optional: Add auth check here if needed
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      return NextResponse.json(
        createResponse(401, 'Unauthorized - This endpoint requires admin authentication'),
        { status: 401 }
      );
    }

    logger.info('Starting assignments format sync');
    const updatedCount = await syncAllStudentAssignments();

    logger.info('Assignments format sync completed', { updatedStudents: updatedCount });

    const response = createResponse(200, 'Assignments format migration completed successfully', {
      updatedStudents: updatedCount,
      message: `Updated ${updatedCount} student records with new assignment array format`,
    });
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('Assignments format sync failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
