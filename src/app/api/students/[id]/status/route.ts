/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import {
  createResponse,
  handleDbError,
  handleZodError,
  isValidObjectId,
  logger,
} from '@/lib/utils';
import Student from '@/models/Student';
import { invalidateStudentCache } from '@/lib/cache';
import { requireCurrentUserId } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for status update
const StatusUpdateSchema = z.object({
  status: z.enum(['On Track', 'Behind', 'At Risk', 'Dropped', 'Completed']),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;
    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      logger.info('PUT /api/students/[id]/status - Invalid ObjectId', { id });
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    const body = await request.json();
    const validatedData = StatusUpdateSchema.parse(body);
    const { status } = validatedData;

    const student = await Student.findOneAndUpdate(
      { _id: id, ownerId: userId },
      { currentStatus: status },
      { new: true, runValidators: true }
    );

    if (!student) {
      logger.info('PUT /api/students/[id]/status - Student not found', { id });
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // Invalidate student-related caches
    await invalidateStudentCache(id);

    logger.info('PUT /api/students/[id]/status - Success', { id, status });

    const response = createResponse(200, 'Student status updated successfully', {
      _id: student._id,
      name: student.name,
      currentStatus: student.currentStatus,
      updatedAt: student.updatedAt,
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

    logger.error('PUT /api/students/[id]/status - Failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
