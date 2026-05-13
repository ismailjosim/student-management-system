import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import Student from '@/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query params for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get failing students (At Risk or Behind)
    const students = await Student.find({
      currentStatus: { $in: ['Behind', 'At Risk'] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('lastCompletedAssignment');

    // Get total count
    const totalCount = await Student.countDocuments({
      currentStatus: { $in: ['Behind', 'At Risk'] },
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      createResponse(200, 'Failing students fetched successfully', {
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
