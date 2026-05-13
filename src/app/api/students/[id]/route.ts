/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import {
  createResponse,
  handleDbError,
  handleZodError,
  isValidObjectId,
  logger,
  sanitizeInput,
  calculateDaysDifference,
} from '@/lib/utils';
import { StudentUpdateSchema } from '@/lib/validators';
import Student from '@/models/Student';
import Assignment from '@/models/Assignment';
import CallLog from '@/models/CallLog';
import FollowUp from '@/models/FollowUp';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      logger.info('GET /api/students/[id] - Invalid ObjectId', { id });
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    const student = await Student.findById(id).lean();

    if (!student) {
      logger.info('GET /api/students/[id] - Not found', { id });
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // Fetch all related data
    const [assignments, callLogs, followUps] = await Promise.all([
      Assignment.find({ studentId: id }).sort({ assignmentNumber: 1 }).lean(),
      CallLog.find({ studentId: id }).sort({ date: -1 }).lean(),
      FollowUp.find({ studentId: id }).sort({ date: 1 }).lean(),
    ]);

    // Calculate computed fields
    const totalAssignmentsSubmitted = assignments.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'COMPLETED'
    ).length;

    const nextFollowUpDate = followUps.length > 0 ? followUps[0].date : null;
    const daysSinceLastCall =
      callLogs.length > 0 ? calculateDaysDifference(callLogs[0].date, new Date()) : null;

    const enrichedStudent = {
      ...student,
      assignments,
      callLogs,
      followUps,
      totalAssignmentsSubmitted,
      nextFollowUpDate,
      daysSinceLastCall,
    };

    logger.info('GET /api/students/[id] - Success', { id });
    const response = createResponse(200, 'Student fetched successfully', enrichedStudent);
    return NextResponse.json(response);
  } catch (error) {
    logger.error('GET /api/students/[id] - Failed', error);
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

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      logger.info('PUT /api/students/[id] - Invalid ObjectId', { id });
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    const body = await request.json();

    // Prevent updating immutable fields
    const { _id, createdAt, ...updateData } = body;

    const sanitizedData = sanitizeInput(updateData);
    const validatedData = StudentUpdateSchema.parse(sanitizedData);

    const student = await Student.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      logger.info('PUT /api/students/[id] - Not found', { id });
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    logger.info('PUT /api/students/[id] - Success', { id });
    const response = createResponse(200, 'Student updated successfully', student);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const errorData = handleZodError(error as any);
      return NextResponse.json(
        createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
        { status: errorData.statusCode }
      );
    }

    logger.error('PUT /api/students/[id] - Failed', error);
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

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      logger.info('DELETE /api/students/[id] - Invalid ObjectId', { id });
      return NextResponse.json(createResponse(400, 'Invalid student ID format'), { status: 400 });
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      logger.info('DELETE /api/students/[id] - Not found', { id });
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    // Cascade delete related documents
    await Promise.all([
      Assignment.deleteMany({ studentId: id }),
      CallLog.deleteMany({ studentId: id }),
      FollowUp.deleteMany({ studentId: id }),
    ]);

    logger.info('DELETE /api/students/[id] - Success', { id });
    const response = createResponse(200, 'Student deleted successfully', student);
    return NextResponse.json(response);
  } catch (error) {
    logger.error('DELETE /api/students/[id] - Failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
