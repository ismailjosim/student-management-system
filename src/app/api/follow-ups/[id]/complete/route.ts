/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError } from '@/lib/utils';
import FollowUp from '@/models/FollowUp';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { FollowUpCompleteSchema } from '@/lib/validators';
import { requireCurrentUserId } from '@/lib/auth-utils';

/**
 * PUT /api/follow-ups/[id]/complete
 * Mark a follow-up as completed
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(createResponse(400, 'Invalid follow-up ID'), { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    // Validate optional body if provided
    if (Object.keys(body).length > 0) {
      FollowUpCompleteSchema.parse(body);
    }

    const completedDate = body.completedDate || new Date();

    const followUp = await FollowUp.findOneAndUpdate(
      { _id: id, ownerId: userId },
      {
        status: 'completed',
        completedDate,
      },
      { new: true, runValidators: true }
    ).populate('studentId');

    if (!followUp) {
      return NextResponse.json(createResponse(404, 'Follow-up not found'), { status: 404 });
    }

    const response = createResponse(200, 'Follow-up marked as completed', followUp);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const errorData = handleZodError(error as any);
      return NextResponse.json(
        createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
        { status: errorData.statusCode }
      );
    }

    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
