/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError, logger } from '@/lib/utils';
import Student from '@/models/Student';
import { invalidateStudentCache } from '@/lib/cache';
import { requireCurrentUserId } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for bulk update
const BulkUpdateSchema = z.object({
  studentIds: z.array(z.string().min(1, 'Student ID is required')),
  status: z.enum(['On Track', 'Behind', 'At Risk', 'Dropped', 'Completed']),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    const body = await request.json();
    const validatedData = BulkUpdateSchema.parse(body);
    const { studentIds, status } = validatedData;

    if (studentIds.length === 0) {
      return NextResponse.json(createResponse(400, 'At least one student ID is required'), {
        status: 400,
      });
    }

    const result = await Student.updateMany(
      { ownerId: userId, _id: { $in: studentIds } },
      { currentStatus: status }
    );

    // Invalidate student-related caches after bulk update
    if (result.modifiedCount > 0) {
      await invalidateStudentCache();
    }

    logger.info('POST /api/students/bulk-update', {
      count: result.modifiedCount,
      status,
    });

    const response = createResponse(200, 'Students updated successfully', {
      updated: result.modifiedCount,
      total: studentIds.length,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const errorData = handleZodError(error as any);
      return NextResponse.json(
        createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
        { status: errorData.statusCode }
      );
    }

    logger.error('POST /api/students/bulk-update failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
