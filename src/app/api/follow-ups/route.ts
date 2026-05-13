/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, handleZodError, getPaginationParams } from '@/lib/utils';
import { FollowUpCreateSchema } from '@/lib/validators';
import { updateOverdueStatus } from '@/lib/follow-up-logic';
import FollowUp from '@/models/FollowUp';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { skip } = getPaginationParams(page, limit);

    // Update overdue status
    await updateOverdueStatus();

    // Build filter
    const filter: any = {};
    if (studentId) {
      if (!ObjectId.isValid(studentId)) {
        return NextResponse.json(createResponse(400, 'Invalid student ID'), { status: 400 });
      }
      filter.studentId = new ObjectId(studentId);
    }
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const [followUps, total] = await Promise.all([
      FollowUp.find(filter).populate('studentId').sort({ date: 1 }).skip(skip).limit(limit),
      FollowUp.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    const response = createResponse(200, 'Follow-ups fetched successfully', {
      data: followUps,
      pagination: { page, limit, total, pages },
    });

    return NextResponse.json(response);
  } catch (error) {
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = FollowUpCreateSchema.parse(body);

    // Verify student exists
    const student = await Student.findById(validatedData.studentId);
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    const followUp = new FollowUp({
      ...validatedData,
      status: 'pending',
    });
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
