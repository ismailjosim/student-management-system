/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError } from '@/lib/utils';
import { FollowUpUpdateSchema } from '@/lib/validators';
import FollowUp from '@/models/FollowUp';
import { requireCurrentUserId } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(createResponse(400, 'Invalid follow-up ID'), { status: 400 });
    }

    const followUp = await FollowUp.findOne({ _id: id, ownerId: userId }).populate('studentId');

    if (!followUp) {
      return NextResponse.json(createResponse(404, 'Follow-up not found'), { status: 404 });
    }

    return NextResponse.json(createResponse(200, 'Follow-up fetched successfully', followUp));
  } catch (error) {
    const errorData = handleDbError(error);

    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}

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

    const body = await request.json();

    const validatedData = FollowUpUpdateSchema.parse(body);

    const followUp = await FollowUp.findOneAndUpdate({ _id: id, ownerId: userId }, validatedData, {
      new: true,
      runValidators: true,
    }).populate('studentId');

    if (!followUp) {
      return NextResponse.json(createResponse(404, 'Follow-up not found'), { status: 404 });
    }

    return NextResponse.json(createResponse(200, 'Follow-up updated successfully', followUp));
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(createResponse(400, 'Invalid follow-up ID'), { status: 400 });
    }

    const followUp = await FollowUp.findOneAndDelete({ _id: id, ownerId: userId });

    if (!followUp) {
      return NextResponse.json(createResponse(404, 'Follow-up not found'), { status: 404 });
    }

    return NextResponse.json(createResponse(200, 'Follow-up deleted successfully', followUp));
  } catch (error) {
    const errorData = handleDbError(error);

    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
