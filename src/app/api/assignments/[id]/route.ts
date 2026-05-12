/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError } from '@/lib/utils';
import { AssignmentUpdateSchema } from '@/lib/validators';
import Assignment from '@/models/Assignment';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const assignment = await Assignment.findById(id).populate('studentId');

    if (!assignment) {
      return NextResponse.json(createResponse(404, 'Assignment not found'), { status: 404 });
    }

    const response = createResponse(200, 'Assignment fetched successfully', assignment);
    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to fetch assignment'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = AssignmentUpdateSchema.parse(body);
    const { id } = await params;

    const assignment = await Assignment.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    }).populate('studentId');

    if (!assignment) {
      return NextResponse.json(createResponse(404, 'Assignment not found'), { status: 404 });
    }

    const response = createResponse(200, 'Assignment updated successfully', assignment);
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

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return NextResponse.json(createResponse(404, 'Assignment not found'), { status: 404 });
    }

    const response = createResponse(200, 'Assignment deleted successfully', assignment);
    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to delete assignment'), { status: 500 });
  }
}
