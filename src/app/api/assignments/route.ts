/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import {
  createResponse,
  handleDbError,
  handleZodError,
  getPaginationParams,
  isValidObjectId,
  logger,
} from '@/lib/utils';
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
    const assignmentNumber = searchParams.get('assignmentNumber');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { skip } = getPaginationParams(page, limit);

    // Build filter
    const filter: any = {};

    if (studentId) {
      if (!isValidObjectId(studentId)) {
        return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
      }
      filter.studentId = studentId;
    }

    if (assignmentNumber) {
      const num = parseInt(assignmentNumber);
      if (num < 1 || num > 10) {
        return NextResponse.json(
          createResponse(400, 'Assignment number must be between 1 and 10'),
          { status: 400 }
        );
      }
      filter.assignmentNumber = num;
    }

    if (status) {
      if (!['PENDING', 'SUBMITTED', 'COMPLETED', 'NOT_DEFINED'].includes(status)) {
        return NextResponse.json(createResponse(400, 'Invalid status value'), { status: 400 });
      }
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.completedDate = {};
      if (startDate) {
        filter.completedDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.completedDate.$lte = new Date(endDate);
      }
    }

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate('studentId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(filter),
    ]);

    // Calculate stats for current filter
    const stats = {
      totalAssignments: total,
      submittedCount: await Assignment.countDocuments({
        ...filter,
        status: 'SUBMITTED',
      }),
      completedCount: await Assignment.countDocuments({
        ...filter,
        status: 'COMPLETED',
      }),
      pendingCount: await Assignment.countDocuments({
        ...filter,
        status: 'PENDING',
      }),
    };

    const pages = Math.ceil(total / limit);

    logger.info('GET /api/assignments', {
      page,
      limit,
      filters: { studentId, assignmentNumber, status },
    });

    return NextResponse.json(
      {
        ...createResponse(200, 'Assignments fetched successfully', assignments),
        pagination: { page, limit, total, pages },
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('GET /api/assignments failed', error);
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
    const validatedData = AssignmentCreateSchema.parse(body);

    // Check for duplicate assignment
    const existing = await Assignment.findOne({
      studentId: validatedData.studentId,
      assignmentNumber: validatedData.assignmentNumber,
    });

    if (existing) {
      return NextResponse.json(
        createResponse(409, 'Assignment already exists for this student', undefined, [
          {
            field: 'assignmentNumber',
            message: 'This student already has an assignment with this number',
          },
        ]),
        { status: 409 }
      );
    }

    const assignment = new Assignment(validatedData);
    await assignment.save();
    await assignment.populate('studentId');

    logger.info('POST /api/assignments', {
      assignmentId: assignment._id,
      studentId: assignment.studentId,
    });

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

    logger.error('POST /api/assignments failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
