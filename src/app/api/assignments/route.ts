/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError, getPaginationParams } from '@/lib/utils';
import { AssignmentCreateSchema } from '@/lib/validators';
import Assignment from '@/models/Assignment';
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

    const [assignments, total] = await Promise.all([
      Assignment.find(filter).populate('studentId').skip(skip).limit(limit),
      Assignment.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    const response = createResponse(200, 'Assignments fetched successfully', {
      data: assignments,
      pagination: { page, limit, total, pages },
    });

    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to fetch assignments'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = AssignmentCreateSchema.parse(body);

    const assignment = new Assignment(validatedData);
    await assignment.save();
    await assignment.populate('studentId');

    const response = createResponse(201, 'Assignment created successfully', assignment);
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
