import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query params for pagination and filtering
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const device = searchParams.get('device');
    const division = searchParams.get('division');

    // Build filter
    const filter: Record<string, unknown> = {};
    if (search) {
      // If search contains @, treat as exact email match; otherwise, fuzzy search
      if (search.includes('@')) {
        filter.email = search.toLowerCase();
      } else {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }
    }
    if (status) {
      filter.currentStatus = status;
    }
    if (device) {
      filter.workingDevice = device;
    }
    if (division) {
      filter.division = division;
    }

    // Get students
    const students = await Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    // Get total count
    const totalCount = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      createResponse(200, 'Students fetched successfully', {
        data: students,
        count: students.length,
        total: totalCount,
        page,
        totalPages,
      })
    );
  } catch (error) {
    const errorData = handleDbError(error);
    return NextResponse.json(createResponse(errorData.statusCode, errorData.message), {
      status: errorData.statusCode,
    });
  }
}
