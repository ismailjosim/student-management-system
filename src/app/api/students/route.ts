/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import {
  createResponse,
  handleDbError,
  handleZodError,
  getPaginationParams,
  logger,
  sanitizeInput,
} from '@/lib/utils';
import { StudentCreateSchema } from '@/lib/validators';
import Student from '@/models/Student';
import Assignment from '@/models/Assignment';
import CallLog from '@/models/CallLog';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const { skip } = getPaginationParams(page, limit);

    // Build query filter
    const filter: any = {};

    if (search) {
      // If search contains @, treat as exact email match; otherwise, fuzzy search
      if (search.includes('@')) {
        filter.email = search.toLowerCase();
      } else {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search.replace(/\D/g, ''), $options: 'i' } },
        ];
      }
    }

    if (status) {
      filter.currentStatus = status;
    }

    // Validate sortBy field
    const allowedSortFields = ['createdAt', 'lastContactedAt', 'lastCompletedAssignment', 'name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const sortObj: any = { [sortField]: sortOrder };

    const [students, total] = await Promise.all([
      Student.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Student.countDocuments(filter),
    ]);

    // Enrich students with assignment count and last call date
    const enrichedStudents = await Promise.all(
      students.map(async (student: any) => {
        const assignmentCount = await Assignment.countDocuments({ studentId: student._id });
        const lastCall = await CallLog.findOne({ studentId: student._id })
          .sort({ date: -1 })
          .lean();

        return {
          ...student,
          assignmentCount,
          lastCallDate: lastCall?.date || null,
        };
      })
    );

    const pages = Math.ceil(total / limit);

    logger.info('GET /api/students', { page, limit, search, status, total });

    const response = createResponse(200, 'Students fetched successfully', enrichedStudents);
    return NextResponse.json(
      {
        ...response,
        pagination: { page, limit, total, pages },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('GET /api/students failed', error);
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
    const sanitizedData = sanitizeInput(body);
    const validatedData = StudentCreateSchema.parse(sanitizedData);

    const student = new Student(validatedData);
    await student.save();

    logger.info('POST /api/students', { studentId: student._id, email: student.email });
    const response = createResponse(201, 'Student created successfully', student);
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
