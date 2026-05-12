/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError } from '@/lib/utils';
import { CallLogUpdateSchema } from '@/lib/validators';
import CallLog from '@/models/CallLog';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const callLog = await CallLog.findById(id).populate('studentId');

    if (!callLog) {
      return NextResponse.json(createResponse(404, 'Call log not found'), { status: 404 });
    }

    const response = createResponse(200, 'Call log fetched successfully', callLog);
    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to fetch call log'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const validatedData = CallLogUpdateSchema.parse(body);

    const callLog = await CallLog.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    }).populate('studentId');

    if (!callLog) {
      return NextResponse.json(createResponse(404, 'Call log not found'), { status: 404 });
    }

    const response = createResponse(200, 'Call log updated successfully', callLog);
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

    const callLog = await CallLog.findByIdAndDelete(id);

    if (!callLog) {
      return NextResponse.json(createResponse(404, 'Call log not found'), { status: 404 });
    }

    const response = createResponse(200, 'Call log deleted successfully', callLog);
    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to delete call log'), { status: 500 });
  }
}
