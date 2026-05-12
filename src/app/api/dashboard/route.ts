/* eslint-disable @typescript-eslint/no-explicit-any */

import { connectDB } from '@/lib/mongodb';
import { createResponse, handleDbError } from '@/lib/utils';
import Student from '@/models/Student';
import Assignment from '@/models/Assignment';
import CallLog from '@/models/CallLog';
import FollowUp from '@/models/FollowUp';
import { DashboardStats } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const [students, assignments, callLogs, followUps] = await Promise.all([
      Student.find(),
      Assignment.find(),
      CallLog.find(),
      FollowUp.find(),
    ]);

    const stats: DashboardStats = {
      totalStudents: students.length,
      activeStudents: students.filter((s: any) => s.status === 'active').length,
      totalAssignments: assignments.length,
      pendingAssignments: assignments.filter((a: any) => a.status === 'pending').length,
      totalCallLogs: callLogs.length,
      pendingFollowUps: followUps.filter((f: any) => f.status === 'pending').length,
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
