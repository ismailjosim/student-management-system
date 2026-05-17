/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, getPaginationParams } from '@/lib/utils';
import FollowUp from '@/models/FollowUp';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

/**
 * GET /api/students/[id]/follow-ups
 * Get all follow-ups for a specific student
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(createResponse(400, 'Invalid student ID'), { status: 400 });
    }

    // Verify student exists
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(createResponse(404, 'Student not found'), { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    const { skip } = getPaginationParams(page, limit);

    // Build filter
    const filter: any = { studentId: id };
    if (!includeCompleted) {
      filter.status = { $ne: 'completed' };
    }

    const [followUps, total] = await Promise.all([
      FollowUp.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
      FollowUp.countDocuments(filter),
    ]);

    // Find next scheduled and last completed
    const nextScheduled = await FollowUp.findOne({
      studentId: id,
      status: 'pending',
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    const lastCompleted = await FollowUp.findOne({
      studentId: id,
      status: 'completed',
    }).sort({ completedDate: -1 });

    const pages = Math.ceil(total / limit);

    const response = createResponse(200, 'Student follow-ups fetched successfully', {
      data: followUps,
      nextScheduled,
      lastCompleted,
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
