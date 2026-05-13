import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import Student from '@/models/Student';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Get total students
    const totalStudents = await Student.countDocuments();

    // For each assignment 1-10, count how many students have completed it
    const stats = [];

    for (let i = 1; i <= 10; i++) {
      const submittedCount = await Student.countDocuments({
        lastCompletedAssignment: { $gte: i },
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
