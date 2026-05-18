import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import { requireCurrentUserId } from '@/lib/auth-utils';
import Student from '@/models/Student';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const authResult = await requireCurrentUserId();
    if (authResult.response) return authResult.response;
    const userId = authResult.userId;

    // Get total students
    const totalStudents = await Student.countDocuments({ ownerId: userId });

    // For each assignment 1-10, count how many students have completed it
    const stats = [];

    for (let i = 1; i <= 10; i++) {
      const submittedCount = await Student.countDocuments({
        ownerId: userId,
        assignments: {
          $elemMatch: {
            assignmentNumber: i,
            status: { $in: ['SUBMITTED', 'COMPLETED'] },
          },
        },
      });

      const submissionRate =
        totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

      stats.push({
        assignmentNumber: i,
        submitted: submittedCount,
        total: totalStudents,
        rate: submissionRate,
      });
    }

    return NextResponse.json(
      createResponse(200, 'Assignment stats fetched successfully', {
        stats,
        totalStudents,
      })
    );
  } catch (error) {
    const errorData = handleDbError(error);
    return NextResponse.json(createResponse(errorData.statusCode, errorData.message), {
      status: errorData.statusCode,
    });
  }
}
