/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError } from '@/lib/utils';
import { CallLogUpdateSchema } from '@/lib/validators';
import { calculateNextFollowUp } from '@/lib/follow-up-logic';
import CallLog from '@/models/CallLog';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(createResponse(400, 'Invalid call log ID'), { status: 400 });
    }

    const callLog = await CallLog.findById(id).populate('studentId');

    if (!callLog) {
      return NextResponse.json(createResponse(404, 'Call log not found'), { status: 404 });
    }

    const response = createResponse(200, 'Call log fetched successfully', callLog);
    return NextResponse.json(response);
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
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(createResponse(400, 'Invalid call log ID'), { status: 400 });
    }

    const body = await request.json();
    const validatedData = CallLogUpdateSchema.parse(body);

    const existingCallLog = await CallLog.findById(id);
    if (!existingCallLog) {
      return NextResponse.json(createResponse(404, 'Call log not found'), { status: 404 });
    }

    // If date is being updated, recalculate nextFollowUp
    if (validatedData.date && validatedData.date !== existingCallLog.date) {
      validatedData.nextFollowUp = calculateNextFollowUp(validatedData.date);
    }

    const callLog = await CallLog.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    }).populate('studentId');

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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(createResponse(400, 'Invalid call log ID'), { status: 400 });
    }

    const callLog = await CallLog.findByIdAndDelete(id);

    if (!callLog) {
      return NextResponse.json(createResponse(404, 'Call log not found'), { status: 404 });
    }

    // Update student's lastContactedAt if this was the most recent call
    const mostRecentCall = await CallLog.findOne({
      studentId: callLog.studentId,
    }).sort({ date: -1 });

    await Student.findByIdAndUpdate(callLog.studentId, {
      lastContactedAt: mostRecentCall ? mostRecentCall.date : null,
    });

    const response = createResponse(200, 'Call log deleted successfully', callLog);
    return NextResponse.json(response);
  } catch (error) {
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
