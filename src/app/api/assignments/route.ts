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
import { UpdateStudentAssignmentSchema } from '@/lib/validators';
import Student from '@/models/Student';
import type { StudentAssignment } from '@/models/Student';
import { Types } from 'mongoose';
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

    const { skip } = getPaginationParams(page, limit);

    // Validate filters
    if (studentId && !isValidObjectId(studentId)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    if (assignmentNumber) {
      const num = parseInt(assignmentNumber);
      if (num < 1 || num > 10) {
        return NextResponse.json(
          createResponse(400, 'Assignment number must be between 1 and 10'),
          { status: 400 }
        );
      }
    }

    if (status) {
      if (!['PENDING', 'SUBMITTED', 'COMPLETED'].includes(status)) {
        return NextResponse.json(createResponse(400, 'Invalid status value'), { status: 400 });
      }
    }

    // Build MongoDB aggregation pipeline to get assignments
    const pipeline: any[] = [];

    // Match students by ID if specified
    if (studentId) {
      pipeline.push({ $match: { _id: new Types.ObjectId(studentId) } });
    }

    // Unwind assignments to flatten them
    pipeline.push(
      { $unwind: { path: '$assignments', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 0,
          student: {
            _id: '$_id',
            name: '$name',
            email: '$email',
            phone: '$phone',
          },
          assignmentNumber: '$assignments.assignmentNumber',
          status: '$assignments.status',
          date: '$assignments.date',
        },
      }
    );

    // Apply filters
    const matchStage: any = {};
    if (assignmentNumber) {
      matchStage['assignmentNumber'] = parseInt(assignmentNumber);
    }
    if (status) {
      matchStage['status'] = status;
    }
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Sort and paginate
    pipeline.push(
      { $sort: { 'student._id': -1, assignmentNumber: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const assignments = await Student.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline: any[] = [...pipeline];
    countPipeline.pop(); // Remove $limit
    countPipeline.pop(); // Remove $skip
    countPipeline.push({ $count: 'total' });

    const countResult = await Student.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Calculate stats
    const statsPipeline: any[] = [];
    if (studentId) {
      statsPipeline.push({ $match: { _id: new Types.ObjectId(studentId) } });
    }
    statsPipeline.push({ $unwind: { path: '$assignments', preserveNullAndEmptyArrays: false } });

    if (assignmentNumber) {
      statsPipeline.push({
        $match: { 'assignments.assignmentNumber': parseInt(assignmentNumber) },
      });
    }

    statsPipeline.push({
      $group: {
        _id: null,
        totalAssignments: { $sum: 1 },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$assignments.status', 'PENDING'] }, 1, 0] },
        },
        submittedCount: {
          $sum: { $cond: [{ $eq: ['$assignments.status', 'SUBMITTED'] }, 1, 0] },
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$assignments.status', 'COMPLETED'] }, 1, 0] },
        },
      },
    });

    const statsResult = await Student.aggregate(statsPipeline);
    const stats = statsResult[0] || {
      totalAssignments: 0,
      pendingCount: 0,
      submittedCount: 0,
      completedCount: 0,
    };

    const pages = Math.ceil(total / limit);

    logger.info('GET /api/assignments', {
      page,
      limit,
      filters: { studentId, assignmentNumber, status },
      total,
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

    // Validate that we have studentId
    if (!body.studentId) {
      return NextResponse.json(createResponse(400, 'Student ID is required'), { status: 400 });
    }

    // Validate data
    const validatedData = UpdateStudentAssignmentSchema.parse({
      assignmentNumber: body.assignment || body.assignmentNumber,
      status: body.status,
      date: body.date || body.completedDate || body.submittedDate,
    });

    // Check if student exists
    const student = await Student.findById(body.studentId);
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // Check for duplicate assignment
    const existing = student.assignments?.some(
      (a: any) => a.assignmentNumber === validatedData.assignmentNumber
    );
    if (existing) {
      return NextResponse.json(
        createResponse(409, 'Assignment already exists for this student', undefined, [
          {
            field: 'assignmentNumber',
            message: `This student already has assignment ${validatedData.assignmentNumber}`,
          },
        ]),
        { status: 409 }
      );
    }

    // Create new embedded assignment
    const newAssignment: StudentAssignment = {
      assignmentNumber: validatedData.assignmentNumber,
      status: validatedData.status || 'PENDING',
      date: validatedData.date,
    };

    if (!student.assignments) {
      student.assignments = [];
    }

    student.assignments.push(newAssignment);
    student.assignments.sort((a: any, b: any) => a.assignmentNumber - b.assignmentNumber);

    await student.save();

    logger.info('POST /api/assignments', {
      studentId: body.studentId,
      assignmentNumber: validatedData.assignment,
    });

    const response = createResponse(201, 'Assignment created successfully', newAssignment);
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
