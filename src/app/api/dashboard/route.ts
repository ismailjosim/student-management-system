/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import Student from '@/models/Student';
import CallLog from '@/models/CallLog';
import FollowUp from '@/models/FollowUp';
import { DashboardStats } from '@/types';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const [students, callLogs, followUps] = await Promise.all([
      Student.find().lean(),
      CallLog.find(),
      FollowUp.find(),
    ]);

    // Calculate assignment stats from embedded assignments
    let totalAssignments = 0;
    let pendingAssignments = 0;
    let completedAssignments = 0;

    students.forEach((student: any) => {
      if (student.assignments && Array.isArray(student.assignments)) {
        student.assignments.forEach((assignment: any) => {
          totalAssignments++;
          if (assignment.status === 'PENDING') {
            pendingAssignments++;
          } else if (assignment.status === 'COMPLETED') {
            completedAssignments++;
          }
        });
      }
    });

    const stats: DashboardStats = {
      totalStudents: students.length,
      activeStudents: students.filter(
        (s: any) => s.currentStatus !== 'Dropped' && s.currentStatus !== 'Completed'
      ).length,
      onTrackStudents: students.filter((s: any) => s.currentStatus === 'On Track').length,
      atRiskStudents: students.filter((s: any) => s.currentStatus === 'At Risk').length,
      completedStudents: students.filter((s: any) => s.currentStatus === 'Completed').length,
      totalAssignments,
      pendingAssignments,
      completedAssignments,
      totalCallLogs: callLogs.length,
      totalFollowUps: followUps.length,
      pendingFollowUps: followUps.filter((f: any) => new Date(f.date) > new Date()).length,
    };

    const response = createResponse(200, 'Dashboard stats fetched successfully', stats);
    return NextResponse.json(response);
  } catch (error) {
    handleDbError(error);
    return NextResponse.json(createResponse(500, 'Failed to fetch dashboard stats'), {
      status: 500,
    });
  }
}
