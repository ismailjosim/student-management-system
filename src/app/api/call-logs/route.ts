/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError, getPaginationParams } from '@/lib/utils';
import { CallLogCreateSchema } from '@/lib/validators';
import CallLog from '@/models/CallLog';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const studentId = searchParams.get('studentId');

    const { skip } = getPaginationParams(page, limit);
    const filter = studentId ? { studentId } : {};

    const [callLogs, total] = await Promise.all([
      CallLog.find(filter).populate('studentId').sort({ callDate: -1 }).skip(skip).limit(limit),
      CallLog.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    const response = createResponse(200, 'Call logs fetched successfully', {
      data: callLogs,
      pagination: { page, limit, total, pages },
    });

    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to fetch call logs'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = CallLogCreateSchema.parse(body);

    const callLog = new CallLog(validatedData);
    await callLog.save();
    await callLog.populate('studentId');

    const response = createResponse(201, 'Call log created successfully', callLog);
    return NextResponse.json(response, { status: 201 });
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
