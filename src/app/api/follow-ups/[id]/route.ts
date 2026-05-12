/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError } from '@/lib/utils';
import { FollowUpUpdateSchema } from '@/lib/validators';
import FollowUp from '@/models/FollowUp';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const followUp = await FollowUp.findById(id).populate('studentId');

    if (!followUp) {
      return NextResponse.json(createResponse(404, 'Follow-up not found'), { status: 404 });
    }

    const response = createResponse(200, 'Follow-up fetched successfully', followUp);
    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to fetch follow-up'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const validatedData = FollowUpUpdateSchema.parse(body);

    const followUp = await FollowUp.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    }).populate('studentId');

    if (!followUp) {
      return NextResponse.json(createResponse(404, 'Follow-up not found'), { status: 404 });
    }

    const response = createResponse(200, 'Follow-up updated successfully', followUp);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const followUp = await FollowUp.findByIdAndDelete(id);

    if (!followUp) {
      return NextResponse.json(createResponse(404, 'Follow-up not found'), { status: 404 });
    }

    const response = createResponse(200, 'Follow-up deleted successfully', followUp);
    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to delete follow-up'), { status: 500 });
  }
}
