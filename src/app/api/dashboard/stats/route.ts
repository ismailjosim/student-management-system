import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import Student from '@/models/Student';
import Assignment from '@/models/Assignment';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Get total students
    const totalStudents = await Student.countDocuments();

    // Get at-risk students (Behind or At Risk status)
    const atRiskStudents = await Student.countDocuments({
      currentStatus: { $in: ['Behind', 'At Risk'] },
    });

    // Get students needing calls (check if they have pending follow-ups or haven't been called recently)
    const studentsNeedingCalls = await Student.countDocuments({
      currentStatus: { $in: ['Behind', 'At Risk', 'On Track'] },
    });

    // Get on-track students
    const onTrackStudents = await Student.countDocuments({
      currentStatus: 'On Track',
    });

    // Get completed students
    const completedStudents = await Student.countDocuments({
      currentStatus: 'Completed',
    });

    // Get total and completed assignments for progress
    const totalAssignments = await Assignment.countDocuments();
    const completedAssignments = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalCompleted: {
            $sum: {
              $cond: [{ $gt: ['$lastCompletedAssignment', 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    const totalCompletedCount = completedAssignments[0]?.totalCompleted || 0;
    const averageProgress =
      totalAssignments > 0
        ? Math.round((totalCompletedCount / (totalStudents * totalAssignments)) * 100)
        : 0;

    return NextResponse.json(
      createResponse(200, 'Dashboard stats fetched successfully', {
        totalStudents,
        atRiskStudents,
        pendingFollowUps: studentsNeedingCalls,
        onTrackStudents,
        completedStudents,
        averageProgress,
        totalAssignments,
        completedAssignments: totalCompletedCount,
      })
    );
  } catch (error) {
    const errorData = handleDbError(error);
    return NextResponse.json(createResponse(errorData.statusCode, errorData.message), {
      status: errorData.statusCode,
    });
  }
}
