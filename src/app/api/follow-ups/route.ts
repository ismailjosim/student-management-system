/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError, getPaginationParams } from '@/lib/utils';
import { FollowUpCreateSchema } from '@/lib/validators';
import FollowUp from '@/models/FollowUp';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    const { skip } = getPaginationParams(page, limit);
    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    const [followUps, total] = await Promise.all([
      FollowUp.find(filter).populate('studentId').sort({ dueDate: 1 }).skip(skip).limit(limit),
      FollowUp.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    const response = createResponse(200, 'Follow-ups fetched successfully', {
      data: followUps,
      pagination: { page, limit, total, pages },
    });

    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to fetch follow-ups'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = FollowUpCreateSchema.parse(body);

    const followUp = new FollowUp(validatedData);
    await followUp.save();
    await followUp.populate('studentId');

    const response = createResponse(201, 'Follow-up created successfully', followUp);
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
