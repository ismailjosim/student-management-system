/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError, getPaginationParams, logger } from '@/lib/utils';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const { skip } = getPaginationParams(page, limit);

    // Search and Filter Parameters
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const status = searchParams.get('status');
    const division = searchParams.get('division');
    const ageRange = searchParams.get('ageRange');
    const workingDevice = searchParams.get('workingDevice');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');

    // Build dynamic filter
    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (email) {
      filter.email = email.toLowerCase();
    }

    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      filter.phone = { $regex: phoneDigits, $options: 'i' };
    }

    if (status) {
      filter.currentStatus = status;
    }

    if (division) {
      filter.division = division;
    }

    if (ageRange) {
      filter.ageRange = ageRange;
    }

    if (workingDevice) {
      filter.workingDevice = workingDevice;
    }

    // Range queries (if needed in future)
    if (ageMin || ageMax) {
      // This would need additional logic for age range queries
    }

    const [students, total] = await Promise.all([
      Student.find(filter).skip(skip).limit(limit).lean(),
      Student.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    logger.info('GET /api/students/search', {
      filters: { name, email, phone, status, division, ageRange, workingDevice },
      total,
    });

    const response = createResponse(200, 'Search completed successfully', students);
    return NextResponse.json(
      {
        ...response,
        pagination: { page, limit, total, pages },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('GET /api/students/search failed', error);
    const errorData = handleDbError(error);
    return NextResponse.json(
      createResponse(errorData.statusCode, errorData.message, undefined, errorData.errors),
      { status: errorData.statusCode }
    );
  }
}
